# Corral — Events Social App

> Find your people. Find your events.

Corral is a social app for discovering and sharing events — built for live music, doofs, raves, arts events and nightlife. It's designed around the idea that the best way to find out about something is through the people you trust.

Originally prototyped in Lovable. Now a standalone Vite + React + TypeScript project.

---

## Vision

The feed shows **what your friends are going to**, not just a generic list of events. You RSVP, your friends see it, and the social graph surfaces events organically. No algorithm needed — just your network.

Key principles:
- **Social first** — events bubble up through who's going, not paid promotion
- **Low friction** — posting an event should take 30 seconds
- **For scenes** — filters and tagging for music, doof, rave, arts, sport etc.
- **Authentic** — no fake event counts or bots

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Routing | React Router v7 |
| Data fetching | TanStack Query v5 |
| Backend/Auth/DB | Supabase |
| Icons | Lucide React |

---

## Project Structure

```
src/
├── components/
│   ├── EventCard.tsx       — Feed card with RSVP buttons
│   ├── Navbar.tsx          — Top bar + bottom nav
│   └── SearchAndFilters.tsx — Search input + filter chips
├── contexts/
│   └── AuthContext.tsx     — Supabase auth state
├── hooks/
│   └── useEvents.ts        — Events + RSVPs queries/mutations
├── lib/
│   ├── supabase.ts         — Supabase client
│   └── utils.ts            — cn(), formatDate(), formatTime()
├── pages/
│   ├── Index.tsx           — Main social feed
│   ├── Login.tsx           — Sign in / Sign up
│   ├── Discover.tsx        — Browse all events
│   ├── CreateEvent.tsx     — Post a new event
│   ├── EventDetail.tsx     — Single event view + RSVP
│   ├── Profile.tsx         — User profile
│   └── Notifications.tsx   — Activity feed (stub)
└── types/
    └── index.ts            — Shared TypeScript types
```

---

## Database Schema (Supabase)

```sql
-- Events
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date date not null,
  time time,
  location text,
  venue text,
  image_url text,
  price numeric,
  tags text[],
  lat float,
  lng float,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- RSVPs
create table rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  user_id uuid references auth.users(id),
  status text check (status in ('going', 'interested', 'not_going')),
  created_at timestamptz default now(),
  unique(event_id, user_id)
);

-- Friend relations (future)
create table friend_relations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  friend_id uuid references auth.users(id),
  status text check (status in ('pending', 'accepted')),
  created_at timestamptz default now()
);

-- Row Level Security
alter table events enable row level security;
alter table rsvps enable row level security;

-- Anyone can read events
create policy "events_read" on events for select using (true);
-- Only creators can insert their own events
create policy "events_insert" on events for insert with check (auth.uid() = created_by);
-- Anyone authenticated can manage their own RSVPs
create policy "rsvps_select" on rsvps for select using (true);
create policy "rsvps_insert" on rsvps for insert with check (auth.uid() = user_id);
create policy "rsvps_update" on rsvps for update using (auth.uid() = user_id);
```

---

## Getting Started

```bash
# 1. Clone and install
bun install

# 2. Set up environment
cp .env.example .env
# Fill in your Supabase URL and anon key

# 3. Run the DB schema in your Supabase SQL editor

# 4. Start dev server
bun dev
```

---

## Roadmap / Ideas

- [ ] **Heat Map** — colour-coded map of social activity in an area, especially useful for nightlife
- [ ] **Friends feed** — show which friends RSVPed to each event
- [ ] **Follow artists/promoters** — get notified when they post
- [ ] **Event comments/chat** — discussion on each event page
- [ ] **Invite links** — share a Corral event link externally
- [ ] **Push notifications** — reminder when an event is coming up
- [ ] **Scene pages** — e.g. "Melbourne Doof Scene" as a curated feed
- [ ] **Not-for-profit / scene org** — explore registering as NFP to serve the live music/rave/doof community

---

## Design

Dark theme by default. Purple accent (`hsl(270 70% 65%)`). Designed mobile-first as a PWA-ready app.
