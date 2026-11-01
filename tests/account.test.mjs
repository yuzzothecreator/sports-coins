import test from "node:test";
import assert from "node:assert/strict";
import {
  profileFields,
  postContent,
  replyContent,
} from "../src/features/account/schema.ts";

test("public profile inputs normalize names and reject invalid handles", () => {
  assert.deepEqual(
    profileFields.parse({
      username: "  Alex_Fan  ",
      display_name: "  Alex  ",
      bio: " Football fan ",
    }),
    { username: "alex_fan", display_name: "Alex", bio: "Football fan" },
  );
  for (const username of ["ab", "has spaces", "../admin", "x".repeat(31)])
    assert.equal(
      profileFields.safeParse({ username, display_name: "Fan", bio: "" })
        .success,
      false,
    );
  assert.equal(
    profileFields.safeParse({
      username: "valid_fan",
      display_name: "  ",
      bio: "",
    }).success,
    false,
  );
  assert.equal(
    profileFields.safeParse({
      username: "valid_fan",
      display_name: "Fan",
      bio: "x".repeat(501),
    }).success,
    false,
  );
});
test("posts and replies reject blank/oversize content before transmission", () => {
  assert.equal(postContent.parse(" Matchday! "), "Matchday!");
  assert.equal(postContent.safeParse(" ").success, false);
  assert.equal(postContent.safeParse("x".repeat(2001)).success, false);
  assert.equal(replyContent.safeParse("\n ").success, false);
  assert.equal(replyContent.safeParse("x".repeat(1001)).success, false);
});
