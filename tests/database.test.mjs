import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("account and community ownership with two users", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  const alice = "11111111-1111-4111-8111-111111111111";
  const bob = "22222222-2222-4222-8222-222222222222";
  const third = "33333333-3333-4333-8333-333333333333";
  // Only Supabase's auth schema/roles are simulated. Application tables,
  // constraints, policies, grants and triggers come from the real migrations.
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$;
    grant usage on schema auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;
    insert into auth.users values ('${alice}'),('${bob}'),('${third}');`);
  for (const file of (await readdir("supabase/migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    await db.exec(await readFile(`supabase/migrations/${file}`, "utf8"));
  }
  async function asUser(id) {
    await db.exec(
      `reset role; set role authenticated; select set_config('request.jwt.claim.sub','${id}',false);`,
    );
  }
  async function owner() {
    await db.exec(
      "reset role; select set_config('request.jwt.claim.sub','',false);",
    );
  }
  let postId;
  await t.test("all exposed tables have RLS", async () => {
    const { rows } = await db.query(
      "select relname from pg_class join pg_namespace n on n.oid=relnamespace where n.nspname='public' and relkind='r' and not relrowsecurity",
    );
    assert.deepEqual(rows, []);
  });
  await t.test("anonymous writes are rejected", async () => {
    await db.exec("set role anon");
    await assert.rejects(
      db.query(
        "insert into public.posts(user_id,content) values ($1,'Anonymous post')",
        [alice],
      ),
      /permission denied/,
    );
  });
  await t.test(
    "profiles are owner-created and editable only by their owner",
    async () => {
      await asUser(alice);
      await assert.rejects(
        db.query(
          "insert into public.profiles(id,username,display_name) values ($1,'spoof','Spoof')",
          [bob],
        ),
        /row-level security/,
      );
      await db.query(
        "insert into public.profiles(id,username,display_name) values ($1,'alice','Alice')",
        [alice],
      );
      await asUser(bob);
      await db.query(
        "insert into public.profiles(id,username,display_name) values ($1,'bob','Bob')",
        [bob],
      );
      assert.equal(
        (
          await db.query(
            "update public.profiles set bio='Hijacked' where id=$1 returning id",
            [alice],
          )
        ).rows.length,
        0,
      );
      await assert.rejects(
        db.query("update public.profiles set id=$1 where id=$2", [third, bob]),
        /permission denied/,
      );
      await assert.rejects(
        db.query(
          "update public.profiles set created_at='2099-01-01' where id=$1",
          [bob],
        ),
        /permission denied/,
      );
      await assert.rejects(
        db.query("update public.profiles set username='alice' where id=$1", [
          bob,
        ]),
        /unique constraint/,
      );
      await assert.rejects(
        db.query("update public.profiles set username='Bob' where id=$1", [
          bob,
        ]),
        /check constraint/,
      );
      await db.query(
        "update public.profiles set bio='Basketball fan' where id=$1",
        [bob],
      );
      assert.equal(
        (await db.query("select bio from public.profiles where id=$1", [bob]))
          .rows[0].bio,
        "Basketball fan",
      );
    },
  );
  await t.test(
    "posts cannot spoof an author or contain only spaces",
    async () => {
      await asUser(alice);
      await assert.rejects(
        db.query(
          "insert into public.posts(user_id,content) values ($1,'Spoof')",
          [bob],
        ),
        /publish as yourself|row-level security/,
      );
      await assert.rejects(
        db.query(
          "insert into public.posts(user_id,content) values ($1,'   ')",
          [alice],
        ),
        /check constraint/,
      );
      const { rows } = await db.query(
        "insert into public.posts(user_id,content,created_at) values ($1,'Who is ready for matchday?','2000-01-01') returning id,created_at",
        [alice],
      );
      postId = rows[0].id;
      assert.ok(new Date(rows[0].created_at).getFullYear() > 2020);
    },
  );
  await t.test(
    "a second user can reply and the author can read it",
    async () => {
      await asUser(bob);
      assert.equal(
        (
          await db.query("select content from public.posts where id=$1", [
            postId,
          ])
        ).rows[0].content,
        "Who is ready for matchday?",
      );
      await db.query(
        "insert into public.post_comments(user_id,post_id,content) values ($1,$2,'Ready for kickoff!')",
        [bob, postId],
      );
      await assert.rejects(
        db.query(
          "insert into public.post_comments(user_id,post_id,content) values ($1,$2,'Spoof')",
          [alice, postId],
        ),
        /publish as yourself|row-level security/,
      );
      await assert.rejects(
        db.query(
          "insert into public.post_comments(user_id,post_id,content) values ($1,$2,' ')",
          [bob, postId],
        ),
        /check constraint/,
      );
      await asUser(alice);
      const { rows } = await db.query(
        "select c.content,p.username from public.post_comments c join public.profiles p on p.id=c.user_id where post_id=$1",
        [postId],
      );
      assert.deepEqual(rows, [
        { content: "Ready for kickoff!", username: "bob" },
      ]);
    },
  );
  await t.test(
    "likes are public, bookmarks are owner-private, follows cannot spoof",
    async () => {
      await asUser(alice);
      await db.query("insert into public.post_bookmarks values ($1,$2)", [
        alice,
        postId,
      ]);
      await db.query("insert into public.post_likes values ($1,$2)", [
        alice,
        postId,
      ]);
      await asUser(bob);
      assert.equal(
        (await db.query("select * from public.post_bookmarks")).rows.length,
        0,
      );
      assert.equal(
        (
          await db.query(
            "delete from public.post_bookmarks where post_id=$1 returning post_id",
            [postId],
          )
        ).rows.length,
        0,
      );
      assert.equal(
        (
          await db.query(
            "select count(*)::int as count from public.post_likes where post_id=$1",
            [postId],
          )
        ).rows[0].count,
        1,
      );
      await assert.rejects(
        db.query("insert into public.follows values ($1,$2)", [alice, bob]),
        /row-level security/,
      );
      await assert.rejects(
        db.query("insert into public.follows values ($1,$1)", [bob]),
        /check constraint/,
      );
      await db.query("insert into public.follows values ($1,$2)", [bob, alice]);
    },
  );
  await t.test(
    "coin balances and ledger cannot be changed by clients",
    async () => {
      await owner();
      await db.query(
        "insert into public.coin_accounts(user_id,balance) values ($1,50),($2,80)",
        [alice, bob],
      );
      await asUser(alice);
      assert.deepEqual(
        (
          await db.query(
            "select user_id,balance::int from public.coin_accounts",
          )
        ).rows,
        [{ user_id: alice, balance: 50 }],
      );
      await assert.rejects(
        db.exec("update public.coin_accounts set balance=99999"),
        /permission denied/,
      );
      await assert.rejects(
        db.query(
          "insert into public.coin_transactions(user_id,amount,reason,idempotency_key) values ($1,500,'Fake','fake')",
          [alice],
        ),
        /permission denied/,
      );
    },
  );
  await t.test(
    "database rate limits reject excess and backdated writes",
    async () => {
      await asUser(alice);
      for (let i = 0; i < 4; i++)
        await db.query(
          "insert into public.posts(user_id,content,created_at) values ($1,$2,'2000-01-01')",
          [alice, `Extra ${i}`],
        );
      await assert.rejects(
        db.query(
          "insert into public.posts(user_id,content) values ($1,'One too many')",
          [alice],
        ),
        /posting too quickly/,
      );
      await asUser(bob);
      for (let i = 0; i < 19; i++)
        await db.query(
          "insert into public.post_comments(user_id,post_id,content) values ($1,$2,$3)",
          [bob, postId, `Reply ${i}`],
        );
      await assert.rejects(
        db.query(
          "insert into public.post_comments(user_id,post_id,content) values ($1,$2,'One too many')",
          [bob, postId],
        ),
        /posting too quickly/,
      );
    },
  );
  await t.test(
    "only the owner can delete a post; related content is removed",
    async () => {
      await asUser(bob);
      assert.equal(
        (
          await db.query("delete from public.posts where id=$1 returning id", [
            postId,
          ])
        ).rows.length,
        0,
      );
      await asUser(alice);
      assert.equal(
        (
          await db.query("delete from public.posts where id=$1 returning id", [
            postId,
          ])
        ).rows.length,
        1,
      );
      assert.equal(
        (
          await db.query(
            "select * from public.post_comments where post_id=$1",
            [postId],
          )
        ).rows.length,
        0,
      );
      assert.equal(
        (
          await db.query("select * from public.post_likes where post_id=$1", [
            postId,
          ])
        ).rows.length,
        0,
      );
      await assert.rejects(
        db.query(
          "insert into public.posts(user_id,content) values ($1,'Try bypassing by deletion')",
          [alice],
        ),
        /posting too quickly/,
      );
      await assert.rejects(
        db.exec("delete from private.community_write_events"),
        /permission denied/,
      );
    },
  );
});
