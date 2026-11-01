-- Foundation only. Production writes, moderation, reward settlement, and provider
-- ingestion must be implemented and validated on the trusted server.
create table public.profiles (
 id uuid primary key references auth.users on delete cascade,
 username text not null unique check (username ~ '^[a-zA-Z0-9_]{3,30}$'),
 display_name text not null check (char_length(display_name) between 1 and 80),
 bio text not null default '' check (char_length(bio) <= 500),
 avatar_url text,
 created_at timestamptz not null default now()
);
create table public.sports (id text primary key, name text not null);
insert into public.sports values ('football','Football'),('basketball','Basketball'),('tennis','Tennis'),('cricket','Cricket'),('hockey','Ice Hockey');
create table public.competitions (id uuid primary key default gen_random_uuid(), sport_id text not null references public.sports, name text not null);
create table public.teams (id uuid primary key default gen_random_uuid(), sport_id text not null references public.sports, name text not null);
create table public.fixtures (
 id uuid primary key default gen_random_uuid(), competition_id uuid not null references public.competitions,
 home_id uuid not null references public.teams, away_id uuid not null references public.teams,
 starts_at timestamptz not null, status text not null default 'scheduled' check (status in ('scheduled','live','finished','cancelled')),
 provider_id text unique, updated_at timestamptz not null default now(), check(home_id <> away_id)
);
create index fixtures_starts_idx on public.fixtures(starts_at);
create table public.posts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles on delete cascade,
 content text not null check (char_length(content) between 1 and 2000), created_at timestamptz not null default now()
);
create index posts_created_idx on public.posts(created_at desc);
create index posts_user_idx on public.posts(user_id);
create table public.post_likes (user_id uuid references public.profiles on delete cascade, post_id uuid references public.posts on delete cascade, primary key(user_id,post_id));
create table public.post_bookmarks (user_id uuid references public.profiles on delete cascade, post_id uuid references public.posts on delete cascade, primary key(user_id,post_id));
create table public.post_comments (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles on delete cascade, post_id uuid not null references public.posts on delete cascade, content text not null check (char_length(content) between 1 and 1000), created_at timestamptz not null default now());
create index comments_post_idx on public.post_comments(post_id);
create table public.follows (user_id uuid references public.profiles on delete cascade, following_id uuid references public.profiles on delete cascade, primary key(user_id,following_id), check(user_id <> following_id));
create index follows_target_idx on public.follows(following_id);
create table public.prediction_slips (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles on delete cascade,
 visibility text not null default 'private' check(visibility in ('private','public')),
 code text not null unique default replace(gen_random_uuid()::text, '-', ''),
 published_at timestamptz, created_at timestamptz not null default now()
);
create table public.slip_selections (
 id uuid primary key default gen_random_uuid(), slip_id uuid not null references public.prediction_slips on delete cascade,
 fixture_id uuid not null references public.fixtures, market text not null, selection text not null,
 unique(slip_id,fixture_id,market)
);
create index slips_user_idx on public.prediction_slips(user_id);
create table public.chat_rooms (id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles, name text not null check(char_length(name) between 1 and 80), is_public boolean not null default true);
create table public.chat_room_members (room_id uuid references public.chat_rooms on delete cascade, user_id uuid references public.profiles on delete cascade, role text not null default 'member' check(role in ('owner','administrator','moderator','member')), primary key(room_id,user_id));
create table public.chat_messages (id uuid primary key default gen_random_uuid(), room_id uuid not null references public.chat_rooms on delete cascade, user_id uuid not null references public.profiles on delete cascade, content text not null check(char_length(content) between 1 and 1000), created_at timestamptz not null default now());
create index messages_room_time_idx on public.chat_messages(room_id,created_at);
create table public.coin_accounts (user_id uuid primary key references public.profiles on delete cascade, balance bigint not null default 0 check(balance >= 0));
create table public.coin_transactions (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.coin_accounts(user_id), amount bigint not null check(amount <> 0), reason text not null, idempotency_key text not null unique, created_at timestamptz not null default now());
create index coin_transactions_user_idx on public.coin_transactions(user_id,created_at);

-- Explicit grants. Ledger writes and prediction publication remain server-only.
revoke all on public.profiles, public.sports, public.competitions, public.teams, public.fixtures, public.posts, public.post_likes, public.post_bookmarks, public.post_comments, public.follows, public.prediction_slips, public.slip_selections, public.chat_rooms, public.chat_room_members, public.chat_messages, public.coin_accounts, public.coin_transactions from anon, authenticated;
grant select on public.profiles, public.sports, public.competitions, public.teams, public.fixtures, public.posts, public.post_likes, public.post_comments, public.follows, public.prediction_slips, public.slip_selections, public.chat_rooms to anon, authenticated;
grant select on public.post_bookmarks, public.chat_room_members, public.chat_messages, public.coin_accounts, public.coin_transactions to authenticated;
grant insert,update on public.profiles to authenticated;
grant insert,delete on public.posts, public.post_likes, public.post_comments, public.post_bookmarks, public.follows to authenticated;
grant all on public.profiles, public.sports, public.competitions, public.teams, public.fixtures, public.posts, public.post_likes, public.post_bookmarks, public.post_comments, public.follows, public.prediction_slips, public.slip_selections, public.chat_rooms, public.chat_room_members, public.chat_messages, public.coin_accounts, public.coin_transactions to service_role;

alter table public.profiles enable row level security;
alter table public.sports enable row level security;
alter table public.competitions enable row level security;
alter table public.teams enable row level security;
alter table public.fixtures enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_bookmarks enable row level security;
alter table public.follows enable row level security;
alter table public.prediction_slips enable row level security;
alter table public.slip_selections enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_room_members enable row level security;
alter table public.chat_messages enable row level security;
alter table public.coin_accounts enable row level security;
alter table public.coin_transactions enable row level security;

create policy profiles_read on public.profiles for select using(true);
create policy profiles_insert on public.profiles for insert to authenticated with check(id=(select auth.uid()));
create policy profiles_update on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy sports_read on public.sports for select using(true);
create policy competitions_read on public.competitions for select using(true);
create policy teams_read on public.teams for select using(true);
create policy fixtures_read on public.fixtures for select using(true);
create policy posts_read on public.posts for select using(true);
create policy posts_insert on public.posts for insert to authenticated with check(user_id=(select auth.uid()));
create policy posts_delete on public.posts for delete to authenticated using(user_id=(select auth.uid()));
create policy likes_read on public.post_likes for select using(true);
create policy likes_insert on public.post_likes for insert to authenticated with check(user_id=(select auth.uid()));
create policy likes_delete on public.post_likes for delete to authenticated using(user_id=(select auth.uid()));
create policy comments_read on public.post_comments for select using(true);
create policy comments_insert on public.post_comments for insert to authenticated with check(user_id=(select auth.uid()));
create policy comments_delete on public.post_comments for delete to authenticated using(user_id=(select auth.uid()));
create policy bookmarks_read on public.post_bookmarks for select to authenticated using(user_id=(select auth.uid()));
create policy bookmarks_insert on public.post_bookmarks for insert to authenticated with check(user_id=(select auth.uid()));
create policy bookmarks_delete on public.post_bookmarks for delete to authenticated using(user_id=(select auth.uid()));
create policy follows_read on public.follows for select using(true);
create policy follows_insert on public.follows for insert to authenticated with check(user_id=(select auth.uid()));
create policy follows_delete on public.follows for delete to authenticated using(user_id=(select auth.uid()));
create policy slips_read on public.prediction_slips for select using(visibility='public' or user_id=(select auth.uid()));
create policy selections_read on public.slip_selections for select using(exists(select 1 from public.prediction_slips p where p.id=slip_id));
create policy rooms_read on public.chat_rooms for select using(is_public or owner_id=(select auth.uid()));
-- Private-room member access will be added with the moderation milestone.
create policy members_read on public.chat_room_members for select to authenticated using(user_id=(select auth.uid()));
create policy messages_read on public.chat_messages for select to authenticated using(exists(select 1 from public.chat_rooms r where r.id=room_id and r.is_public) or exists(select 1 from public.chat_room_members m where m.room_id=chat_messages.room_id and m.user_id=(select auth.uid())));
create policy accounts_read on public.coin_accounts for select to authenticated using(user_id=(select auth.uid()));
create policy transactions_read on public.coin_transactions for select to authenticated using(user_id=(select auth.uid()));
-- No client grants for coin, room, message, fixture or slip writes. Trusted API
-- endpoints must enforce rate limits, moderation, kickoff locks and atomic ledger
-- transactions before those features can be enabled in connected mode.
