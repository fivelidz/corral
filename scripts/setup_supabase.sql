-- ══════════════════════════════════════════════════════════════════════════════
-- Corral — Full Database Schema
-- Run this in your Supabase SQL editor after creating the project.
-- Phone-first auth: user identity = phone number (via Supabase Auth OTP)
-- ══════════════════════════════════════════════════════════════════════════════

-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for fuzzy text search

-- ══════════════════════════════════════════════════════════════════════════════
-- PROFILES
-- Extends Supabase auth.users. Created automatically on first sign-in.
-- Phone number is the primary identity (stored in auth.users.phone).
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.profiles (
  id            uuid        primary key references auth.users(id) on delete cascade,
  phone         text        unique,                    -- mirrors auth.users.phone
  username      text        unique,                    -- @handle, optional at signup
  display_name  text,                                  -- full name or nickname
  bio           text,
  avatar_url    text,
  city          text        default 'Sydney',
  suburb        text,
  -- scene preferences (derived from RSVPs + explicit picks)
  scene_tags    text[]      default '{}',
  -- privacy
  profile_public boolean    default true,
  -- contacts opt-in
  contacts_sync boolean     default false,
  -- timestamps
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
comment on table public.profiles is 'User profiles extending Supabase auth. Phone is primary identity.';

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id, phone)
  values (
    new.id,
    new.phone
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ══════════════════════════════════════════════════════════════════════════════
-- FOLLOWS / FRIENDS
-- Dual model: one-way follows + mutual friend requests
-- follow_type: 'follow' = one-way, 'friend' = mutual (both accepted)
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.follows (
  id            uuid        primary key default uuid_generate_v4(),
  follower_id   uuid        not null references public.profiles(id) on delete cascade,
  following_id  uuid        not null references public.profiles(id) on delete cascade,
  follow_type   text        not null default 'follow'
                            check (follow_type in ('follow', 'friend_request', 'friend')),
  created_at    timestamptz default now(),
  unique (follower_id, following_id)
);
comment on table public.follows is
  'follow = one-way (like Instagram). friend_request = pending mutual. friend = accepted mutual.';

-- Index for fast social graph queries
create index if not exists follows_follower_idx   on public.follows(follower_id);
create index if not exists follows_following_idx  on public.follows(following_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- EVENTS
-- All events: festivals, clubs, private parties, uni events, tours, gigs.
-- visibility: public / friends / invite
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.events (
  id            uuid        primary key default uuid_generate_v4(),
  created_by    uuid        not null references public.profiles(id) on delete cascade,

  -- Content
  title         text        not null,
  description   text,
  image_url     text,

  -- When
  starts_at     timestamptz not null,
  ends_at       timestamptz,

  -- Where
  location_name text,                    -- "Marquee Sydney" or "Tom's place"
  address       text,
  suburb        text,
  city          text        default 'Sydney',
  lat           double precision,
  lng           double precision,

  -- What kind
  category      text        not null default 'other'
                            check (category in (
                              'festival','club_night','gig','party',
                              'arts','sport','uni','tour_date',
                              'market','workshop','other'
                            )),
  tags          text[]      default '{}',

  -- Pricing
  price_min     numeric     default 0,   -- 0 = free
  price_max     numeric,                 -- null = same as min
  ticket_url    text,

  -- Visibility
  visibility    text        not null default 'public'
                            check (visibility in ('public','friends','invite')),

  -- Series / tours
  series_id     uuid        references public.event_series(id) on delete set null,

  -- Metadata
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  is_cancelled  boolean     default false
);
comment on table public.events is 'All events. category covers the full scope from private parties to major festivals.';

create index if not exists events_starts_at_idx   on public.events(starts_at);
create index if not exists events_city_idx         on public.events(city);
create index if not exists events_created_by_idx   on public.events(created_by);
create index if not exists events_category_idx     on public.events(category);
create index if not exists events_visibility_idx   on public.events(visibility);
-- Full text search
create index if not exists events_fts_idx on public.events
  using gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(location_name,'')));

-- ══════════════════════════════════════════════════════════════════════════════
-- EVENT SERIES / TOURS
-- Links individual events (e.g. a touring artist's dates, or monthly residency)
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.event_series (
  id            uuid        primary key default uuid_generate_v4(),
  created_by    uuid        not null references public.profiles(id) on delete cascade,
  title         text        not null,
  description   text,
  image_url     text,
  series_type   text        default 'recurring'
                            check (series_type in ('tour','recurring','festival_series')),
  artist_name   text,                    -- for tours
  created_at    timestamptz default now()
);

-- Add series FK after both tables exist
alter table public.events
  add constraint events_series_fk
  foreign key (series_id) references public.event_series(id) on delete set null
  deferrable initially deferred;

-- ══════════════════════════════════════════════════════════════════════════════
-- RSVPs
-- User's intent for an event
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.rsvps (
  id            uuid        primary key default uuid_generate_v4(),
  event_id      uuid        not null references public.events(id) on delete cascade,
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  status        text        not null
                            check (status in ('going','interested','not_going')),
  -- Optional note: "Looking for a lift from Newtown"
  note          text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (event_id, user_id)
);
comment on table public.rsvps is 'User RSVP status per event. Upsert on conflict.';

create index if not exists rsvps_event_idx    on public.rsvps(event_id);
create index if not exists rsvps_user_idx     on public.rsvps(user_id);
create index if not exists rsvps_status_idx   on public.rsvps(status);

-- ══════════════════════════════════════════════════════════════════════════════
-- EVENT INVITES
-- For invite-only events: explicit invites to specific phone numbers
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.event_invites (
  id            uuid        primary key default uuid_generate_v4(),
  event_id      uuid        not null references public.events(id) on delete cascade,
  invited_by    uuid        not null references public.profiles(id) on delete cascade,
  -- Either a registered user or a phone number (pre-registration invite)
  invited_user  uuid        references public.profiles(id) on delete cascade,
  invited_phone text,                    -- for inviting non-users
  accepted      boolean     default null, -- null=pending, true=accepted, false=declined
  created_at    timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- In-app notification log
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.notifications (
  id            uuid        primary key default uuid_generate_v4(),
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  type          text        not null
                            check (type in (
                              'friend_rsvp',        -- a friend said they're going
                              'event_update',       -- event you're going to was updated
                              'event_reminder',     -- event is tomorrow
                              'friend_request',     -- someone wants to connect
                              'friend_accepted',    -- your friend request was accepted
                              'new_follower',       -- someone followed you
                              'event_invite',       -- you were invited to an event
                              'new_event'           -- someone you follow posted an event
                            )),
  -- Contextual IDs
  actor_id      uuid        references public.profiles(id) on delete set null,
  event_id      uuid        references public.events(id)   on delete cascade,
  -- Content
  title         text        not null,
  body          text,
  -- State
  read          boolean     default false,
  created_at    timestamptz default now()
);
create index if not exists notifications_user_idx    on public.notifications(user_id);
create index if not exists notifications_read_idx    on public.notifications(user_id, read);

-- ══════════════════════════════════════════════════════════════════════════════
-- VIBE RATINGS (feeds into HEAT)
-- Post-event ratings from attendees
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.vibe_ratings (
  id            uuid        primary key default uuid_generate_v4(),
  event_id      uuid        not null references public.events(id) on delete cascade,
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  energy        smallint    check (energy between 1 and 10),
  crowd         smallint    check (crowd between 1 and 10),
  music         smallint    check (music between 1 and 10),
  value         smallint    check (value between 1 and 10),
  was_there     boolean     default true,
  created_at    timestamptz default now(),
  unique (event_id, user_id)
);

-- ══════════════════════════════════════════════════════════════════════════════
-- CONTACTS (hashed, for friend discovery)
-- Stores hashed phone numbers from user's contacts for privacy-safe matching
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.contact_hashes (
  id            uuid        primary key default uuid_generate_v4(),
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  phone_hash    text        not null,    -- SHA-256 of normalised E.164 number
  created_at    timestamptz default now(),
  unique (user_id, phone_hash)
);
create index if not exists contacts_hash_idx on public.contact_hashes(phone_hash);
comment on table public.contact_hashes is
  'Hashed phone numbers from contacts for friend discovery. Never stores raw numbers.';

-- ══════════════════════════════════════════════════════════════════════════════
-- USEFUL VIEWS
-- ══════════════════════════════════════════════════════════════════════════════

-- Event with RSVP counts
create or replace view public.events_with_counts as
select
  e.*,
  count(r.id) filter (where r.status = 'going')      as going_count,
  count(r.id) filter (where r.status = 'interested') as interested_count
from public.events e
left join public.rsvps r on r.event_id = e.id
group by e.id;

-- ══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════════════

alter table public.profiles        enable row level security;
alter table public.follows         enable row level security;
alter table public.events          enable row level security;
alter table public.event_series    enable row level security;
alter table public.rsvps           enable row level security;
alter table public.event_invites   enable row level security;
alter table public.notifications   enable row level security;
alter table public.vibe_ratings    enable row level security;
alter table public.contact_hashes  enable row level security;

-- ── Profiles ──────────────────────────────────────────────────────────────────
create policy "profiles_public_read"   on public.profiles for select  using (profile_public = true or auth.uid() = id);
create policy "profiles_own_update"    on public.profiles for update  using (auth.uid() = id);
create policy "profiles_own_insert"    on public.profiles for insert  with check (auth.uid() = id);

-- ── Follows ───────────────────────────────────────────────────────────────────
create policy "follows_read_own"       on public.follows for select  using (auth.uid() = follower_id or auth.uid() = following_id);
create policy "follows_insert_own"     on public.follows for insert  with check (auth.uid() = follower_id);
create policy "follows_delete_own"     on public.follows for delete  using (auth.uid() = follower_id);
create policy "follows_update_own"     on public.follows for update  using (auth.uid() = following_id); -- accept friend request

-- ── Events ────────────────────────────────────────────────────────────────────
-- Public events: anyone can read
create policy "events_public_read"     on public.events for select
  using (
    visibility = 'public'
    or auth.uid() = created_by
    or (
      visibility = 'friends'
      and exists (
        select 1 from public.follows
        where follower_id = auth.uid() and following_id = created_by
          and follow_type in ('follow','friend')
      )
    )
    or (
      visibility = 'invite'
      and exists (
        select 1 from public.event_invites
        where event_id = events.id and invited_user = auth.uid() and accepted is not false
      )
    )
  );
create policy "events_create"          on public.events for insert  with check (auth.uid() = created_by);
create policy "events_update_own"      on public.events for update  using (auth.uid() = created_by);
create policy "events_delete_own"      on public.events for delete  using (auth.uid() = created_by);

-- ── RSVPs ─────────────────────────────────────────────────────────────────────
create policy "rsvps_read_all"         on public.rsvps for select  using (true);
create policy "rsvps_own_write"        on public.rsvps for insert  with check (auth.uid() = user_id);
create policy "rsvps_own_update"       on public.rsvps for update  using (auth.uid() = user_id);
create policy "rsvps_own_delete"       on public.rsvps for delete  using (auth.uid() = user_id);

-- ── Notifications ─────────────────────────────────────────────────────────────
create policy "notifications_own"      on public.notifications for all using (auth.uid() = user_id);

-- ── Vibe ratings ──────────────────────────────────────────────────────────────
create policy "vibes_read_all"         on public.vibe_ratings for select using (true);
create policy "vibes_own_write"        on public.vibe_ratings for insert with check (auth.uid() = user_id);
create policy "vibes_own_update"       on public.vibe_ratings for update using (auth.uid() = user_id);

-- ── Contact hashes ────────────────────────────────────────────────────────────
create policy "contacts_own"           on public.contact_hashes for all using (auth.uid() = user_id);

-- ── Event invites ─────────────────────────────────────────────────────────────
create policy "invites_read_own"       on public.event_invites for select
  using (auth.uid() = invited_by or auth.uid() = invited_user);
create policy "invites_create"         on public.event_invites for insert
  with check (auth.uid() = invited_by);
create policy "invites_accept"         on public.event_invites for update
  using (auth.uid() = invited_user);

-- ── Series ────────────────────────────────────────────────────────────────────
create policy "series_public_read"     on public.event_series for select using (true);
create policy "series_own_write"       on public.event_series for insert  with check (auth.uid() = created_by);
create policy "series_own_update"      on public.event_series for update  using (auth.uid() = created_by);

-- ══════════════════════════════════════════════════════════════════════════════
-- REALTIME
-- Enable Supabase Realtime for live HEAT updates and notifications
-- ══════════════════════════════════════════════════════════════════════════════
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table
    public.rsvps,
    public.notifications,
    public.vibe_ratings;
commit;

-- ══════════════════════════════════════════════════════════════════════════════
-- SCRAPED EVENTS TRACKING
-- Records events that were auto-imported by the scraper.
-- Used for deduplication across scraper runs.
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.scraped_events (
  id            uuid        primary key default uuid_generate_v4(),
  event_id      uuid        references public.events(id) on delete cascade,
  source        text        not null,          -- 'eventbrite', 'ra', 'humanitix', 'ical'
  source_id     text        not null,          -- original ID from the source
  source_url    text,                          -- original listing URL
  fingerprint   text        not null unique,   -- SHA-256(source:source_id)
  scraped_at    timestamptz default now()
);
create index if not exists scraped_events_fingerprint_idx on public.scraped_events(fingerprint);
create index if not exists scraped_events_source_idx      on public.scraped_events(source);
comment on table public.scraped_events is
  'Tracks events imported by the auto-scraper. fingerprint = SHA-256(source:source_id) for dedup.';

-- RLS: service role only (scraper uses service key, not anon)
alter table public.scraped_events enable row level security;
-- No user-facing policies — scraper bypasses RLS with service key

-- ══════════════════════════════════════════════════════════════════════════════
-- USER DEMOGRAPHICS (progressive disclosure model)
-- Users unlock demographic insights proportional to what they've shared.
-- The more you put in, the more you see about others at venues.
-- ══════════════════════════════════════════════════════════════════════════════

-- What each user has opted to share for Heat demographics
create table if not exists public.user_heat_prefs (
  user_id           uuid        primary key references public.profiles(id) on delete cascade,

  -- Each field is opt-in. NULL = not shared. Set = shared + unlocks that dimension.
  share_age         boolean     default false,   -- shares age range for Heat demographics
  share_gender      boolean     default false,   -- shares gender for Heat demographics
  share_suburb      boolean     default false,   -- shares home suburb for Heat demographics
  share_music       boolean     default false,   -- shares music tastes for Heat demographics
  share_vibe        boolean     default false,   -- submits vibe ratings after events

  -- Derived: how many dimensions have they shared?
  -- Computed as: share_age::int + share_gender::int + share_suburb::int + share_music::int + share_vibe::int
  -- Used to gate what they can see: 0=nothing, 1=basic crowd, 2=age, 3=+suburb, 4=+music, 5=full
  disclosure_score  smallint    generated always as (
    share_age::int + share_gender::int + share_suburb::int + share_music::int + share_vibe::int
  ) stored,

  updated_at        timestamptz default now()
);
comment on table public.user_heat_prefs is
  'Controls which demographic dimensions a user shares (and therefore can see). '
  'Progressive model: disclosure_score 0-5 gates what Heat shows you. '
  'Share nothing = see nothing. Share everything = see full crowd demographics.';

alter table public.user_heat_prefs enable row level security;
create policy "heat_prefs_own" on public.user_heat_prefs for all using (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- Run in Supabase dashboard > Storage or via API
-- ══════════════════════════════════════════════════════════════════════════════
-- insert into storage.buckets (id, name, public)
--   values ('event-images', 'event-images', true);
-- insert into storage.buckets (id, name, public)
--   values ('avatars', 'avatars', true);

-- ══════════════════════════════════════════════════════════════════════════════
-- SEED — Demo profiles for testing friend web
-- ══════════════════════════════════════════════════════════════════════════════
-- These are inserted as profiles only (no auth.users entry in dev)
-- In production, real users sign up via OTP

-- NOTE: To test locally, create users via Supabase Auth dashboard first,
-- then these profiles will auto-create via the trigger. Or insert manually:
--
-- insert into public.profiles (id, phone, display_name, username, suburb, scene_tags)
-- values
--   ('11111111-1111-1111-1111-111111111111', '+61400000001', 'Alexei', 'alexei', 'Newtown', '{doof,techno,rave}'),
--   ('22222222-2222-2222-2222-222222222222', '+61400000002', 'Sadiya', 'sadiya', 'Surry Hills', '{jazz,arts,indie}'),
--   ('33333333-3333-3333-3333-333333333333', '+61400000003', 'Jade K', 'jadek', 'Marrickville', '{doof,psytrance}'),
--   ('44444444-4444-4444-4444-444444444444', '+61400000004', 'Max L', 'maxl', 'Newtown', '{techno,warehouse}'),
--   ('55555555-5555-5555-5555-555555555555', '+61400000005', 'Tom W', 'tomw', 'Glebe', '{club,queer}'),
--   ('66666666-6666-6666-6666-666666666666', '+61400000006', 'Mia R', 'miar', 'Redfern', '{live_music,indie}'),
--   ('77777777-7777-7777-7777-777777777777', '+61400000007', 'Ben S', 'bens', 'Erskineville', '{doof,outdoor}'),
--   ('88888888-8888-8888-8888-888888888888', '+61400000008', 'Priya N', 'priyan', 'Chippendale', '{arts,festival}');
