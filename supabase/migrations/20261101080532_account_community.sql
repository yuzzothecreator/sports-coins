-- Accounts are provisioned explicitly after email confirmation. No auth.users
-- trigger is installed: a profile outage must not prevent an Auth signup.
alter table public.profiles add constraint profiles_username_lowercase check (username = lower(username));
alter table public.profiles add constraint profiles_name_not_blank check (char_length(btrim(display_name)) > 0);
alter table public.posts add constraint posts_content_not_blank check (char_length(btrim(content)) > 0);
alter table public.post_comments add constraint comments_content_not_blank check (char_length(btrim(content)) > 0);
-- Only editable public fields are writable; identity and join time are fixed.
revoke insert,update on public.profiles from authenticated;
grant insert(id,username,display_name,bio), update(username,display_name,bio) on public.profiles to authenticated;

create index post_likes_post_idx on public.post_likes(post_id);
create index post_bookmarks_post_idx on public.post_bookmarks(post_id);
create index posts_user_created_idx on public.posts(user_id, created_at desc);
create index comments_user_created_idx on public.post_comments(user_id, created_at desc);
create index selections_fixture_idx on public.slip_selections(fixture_id);
create index room_members_user_idx on public.chat_room_members(user_id);

-- Database enforcement prevents bypassing the UI to flood posts/replies.
-- Advisory transaction locks also serialize concurrent inserts for one author.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table private.community_write_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('posts','post_comments')),
  created_at timestamptz not null default now()
);
create index community_write_events_actor_idx on private.community_write_events(user_id,kind,created_at);
alter table private.community_write_events enable row level security;
grant usage on schema private to authenticated, service_role;
grant select,insert on private.community_write_events to authenticated;
grant all on private.community_write_events to service_role;
create policy write_events_owner_read on private.community_write_events for select to authenticated using(user_id=(select auth.uid()));
create policy write_events_owner_append on private.community_write_events for insert to authenticated with check(user_id=(select auth.uid()) and created_at=now());
-- Append-only quota history survives post deletion. This schema is not exposed
-- in the Data API; granting trigger access cannot grant quota resets/deletions.
create function private.check_community_rate_limit()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare actor uuid; recent_count integer; max_count integer;
begin
  if current_user <> 'authenticated' then return new; end if;
  actor := (select auth.uid());
  if actor is null or new.user_id <> actor then
    raise exception 'You can only publish as yourself.' using errcode = '42501';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(tg_table_name || actor::text, 0));
  if tg_table_name = 'posts' then
    max_count := 5;
  else
    max_count := 20;
  end if;
  select count(*) into recent_count from private.community_write_events
    where user_id=actor and kind=tg_table_name and created_at > now() - interval '1 minute';
  if recent_count >= max_count then
    raise exception 'You are posting too quickly. Please wait a minute and try again.' using errcode = 'P0001';
  end if;
  insert into private.community_write_events(user_id,kind) values(actor,tg_table_name);
  -- Clients cannot backdate records to evade the rate limit.
  new.created_at := now();
  return new;
end;
$$;
revoke all on function private.check_community_rate_limit() from public, anon, authenticated;
create trigger posts_rate_limit before insert on public.posts for each row execute function private.check_community_rate_limit();
create trigger comments_rate_limit before insert on public.post_comments for each row execute function private.check_community_rate_limit();

-- No additional ledger, fixture, room, or prediction-write permissions are
-- introduced here. Shared chat and coin rewards remain server-owned milestones.
