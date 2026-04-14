#!/usr/bin/env python3
"""
Corral — Master Documentation Notion Update
============================================
Rebuilds the full documentation workspace with:

  1. Master Roadmap — every build step, prioritised phases
  2. What's Built Right Now — honest current state audit
  3. How It All Works — architecture, data flow, decisions explained
  4. Progressive Demographics Deep Dive — the earn-your-insights model
  5. Event Scraper Guide — how to operate the auto-ingestion tool
  6. Open Problems & Brainstorm — unsolved design questions + ideas
  7. Updated Project Status — replaces old status page

Run: NOTION_TOKEN=ntn_xxx python3 scripts/notion_master_docs.py
"""

import sys, os

sys.path.insert(0, "/home/fivelidz/.local/lib/python3.11/site-packages")
from notion_client import Client

TOKEN = os.environ.get("NOTION_TOKEN")
if not TOKEN:
    print("ERROR: NOTION_TOKEN not set")
    sys.exit(1)

HUB_ID = "3417463480e9816b9709ecbe766da873"
SADIYA_ID = "3417463480e981108ed6d2b02ebb32d4"

notion = Client(auth=TOKEN)


# ═══════════════════════════════════════════════════════════════════════════════
# BLOCK HELPERS
# ═══════════════════════════════════════════════════════════════════════════════


def h1(t):
    return {
        "object": "block",
        "type": "heading_1",
        "heading_1": {"rich_text": [{"type": "text", "text": {"content": t}}]},
    }


def h2(t):
    return {
        "object": "block",
        "type": "heading_2",
        "heading_2": {"rich_text": [{"type": "text", "text": {"content": t}}]},
    }


def h3(t):
    return {
        "object": "block",
        "type": "heading_3",
        "heading_3": {"rich_text": [{"type": "text", "text": {"content": t}}]},
    }


def p(t):
    return {
        "object": "block",
        "type": "paragraph",
        "paragraph": {"rich_text": [{"type": "text", "text": {"content": t}}]},
    }


def pb(t):
    return {
        "object": "block",
        "type": "paragraph",
        "paragraph": {
            "rich_text": [
                {"type": "text", "text": {"content": t}, "annotations": {"bold": True}}
            ]
        },
    }


def pi(t):
    return {
        "object": "block",
        "type": "paragraph",
        "paragraph": {
            "rich_text": [
                {
                    "type": "text",
                    "text": {"content": t},
                    "annotations": {"italic": True},
                }
            ]
        },
    }


def pc(t):
    return {
        "object": "block",
        "type": "paragraph",
        "paragraph": {
            "rich_text": [
                {"type": "text", "text": {"content": t}, "annotations": {"code": True}}
            ]
        },
    }


def pl(t, u):
    return {
        "object": "block",
        "type": "paragraph",
        "paragraph": {
            "rich_text": [{"type": "text", "text": {"content": t, "link": {"url": u}}}]
        },
    }


def li(t):
    return {
        "object": "block",
        "type": "bulleted_list_item",
        "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": t}}]},
    }


def num(t):
    return {
        "object": "block",
        "type": "numbered_list_item",
        "numbered_list_item": {"rich_text": [{"type": "text", "text": {"content": t}}]},
    }


def todo(t, done=False):
    return {
        "object": "block",
        "type": "to_do",
        "to_do": {
            "rich_text": [{"type": "text", "text": {"content": t}}],
            "checked": done,
        },
    }


def div():
    return {"object": "block", "type": "divider", "divider": {}}


def q(t):
    return {
        "object": "block",
        "type": "quote",
        "quote": {"rich_text": [{"type": "text", "text": {"content": t}}]},
    }


def callout(t, emoji="💡", color="blue_background"):
    return {
        "object": "block",
        "type": "callout",
        "callout": {
            "rich_text": [{"type": "text", "text": {"content": t}}],
            "icon": {"type": "emoji", "emoji": emoji},
            "color": color,
        },
    }


def code(t, lang="plain text"):
    return {
        "object": "block",
        "type": "code",
        "code": {
            "rich_text": [{"type": "text", "text": {"content": t}}],
            "language": lang,
        },
    }


def create_page(parent_id, title, emoji, blocks):
    first = blocks[:100]
    rest = blocks[100:]
    page = notion.pages.create(
        parent={"type": "page_id", "page_id": parent_id},
        icon={"type": "emoji", "emoji": emoji},
        properties={"title": {"title": [{"type": "text", "text": {"content": title}}]}},
        children=first,
    )
    pid = page["id"]
    for i in range(0, len(rest), 100):
        notion.blocks.children.append(pid, children=rest[i : i + 100])
    print(f"  ✅ {title}")
    return page


def clear_and_rewrite(page_id, blocks):
    existing = notion.blocks.children.list(page_id)
    for b in existing.get("results", []):
        try:
            notion.blocks.delete(b["id"])
        except:
            pass
    for i in range(0, len(blocks), 100):
        notion.blocks.children.append(page_id, children=blocks[i : i + 100])


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 1 — MASTER ROADMAP
# Every step to go from where we are to a live product
# ═══════════════════════════════════════════════════════════════════════════════


def roadmap_blocks():
    return [
        callout(
            "The complete build plan for Corral — from current demo to live product. "
            "Each phase builds on the last. Phases 1–2 can be done without any backend. "
            "Phase 3 needs Supabase keys. Phase 4 onwards needs real users.",
            "🗺️",
            "blue_background",
        ),
        div(),
        # ── PHASE 0 ──
        h2("✅ Phase 0 — Foundation (DONE)"),
        p("Everything in this phase is already built and deployed."),
        div(),
        todo("React 19 + TypeScript + Vite 8 + Tailwind v4 — clean scaffold", True),
        todo(
            "All Lovable/Vite boilerplate removed — proper @theme tokens throughout",
            True,
        ),
        todo("Light/dark mode toggle — persisted to localStorage", True),
        todo(
            "Phone-first auth context (OTP via Supabase) with full demo fallback", True
        ),
        todo(
            "Demo mode — app fully works with zero backend, 10 users, 10 events, mock RSVPs",
            True,
        ),
        todo(
            "Event feed with search + 7 filter chips (Tonight, This Week, Free, Doof, Music, Art, Sport)",
            True,
        ),
        todo(
            "Event cards — Going/Interested RSVP toggle, friend avatars, price, tags",
            True,
        ),
        todo("Event detail page", True),
        todo("Create event form", True),
        todo("Discover page — all events, public feed", True),
        todo("Profile page — avatar, stats (mock), sign out", True),
        todo("Notifications page stub", True),
        todo(
            "Agent chat page — demo scripted responses + real endpoint hook (VITE_AGENT_URL)",
            True,
        ),
        todo(
            "HEAT map — Leaflet + heatmap layer, 12 Sydney venues, live sim, filter chips, venue cards",
            True,
        ),
        todo(
            "VenuePanel — slide-up detail: heat score, capacity, sparkline, vibe ratings, demographics",
            True,
        ),
        todo(
            "VenueMode — full analytics screen: donut charts, activity graph, suburb breakdown",
            True,
        ),
        todo(
            "Friend Web — canvas force-directed graph, shared events, follow/friend colouring",
            True,
        ),
        todo(
            "Full Supabase schema — profiles, events, rsvps, follows, notifications, vibe_ratings, contacts",
            True,
        ),
        todo(
            "Progressive demographics data model — user_heat_prefs, getVenueInsights(), disclosure_score",
            True,
        ),
        todo(
            "Event scraper framework — Eventbrite, RA, Humanitix, iCal sources with deduplication",
            True,
        ),
        todo("Notion workspace — Hub, Ideas Log, Questions, Sadiya collab page", True),
        todo("GitHub Actions auto-deploy to GitHub Pages on push to main", True),
        div(),
        # ── PHASE 1 ──
        h2("🔧 Phase 1 — Wire Up the Backend"),
        p("Unblocked once Supabase project is created and keys are added to .env"),
        p("Estimated effort: 1–2 days once keys are in hand."),
        div(),
        todo("Create Supabase project at supabase.com"),
        todo("Run setup_supabase.sql in the Supabase SQL editor"),
        todo("Add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to .env"),
        todo("Test login flow — phone number → OTP → session created"),
        todo(
            "Fix useEvents hook — swap Supabase query column from 'date' to 'starts_at' (known bug)"
        ),
        todo("Test event feed with real Supabase data"),
        todo("Test RSVP upsert with real Supabase data"),
        todo("Create bot user in Supabase Auth for the scraper (SCRAPER_BOT_USER_ID)"),
        todo("Set SUPABASE_SERVICE_KEY + SCRAPER_BOT_USER_ID, run scraper dry-run"),
        todo(
            "Run scraper for real: python3 scripts/event_scraper.py --city Sydney --days 14"
        ),
        todo("Verify scraped events appear in the app feed"),
        div(),
        # ── PHASE 2 ──
        h2("🎨 Phase 2 — Progressive Demographics UI"),
        p(
            "The earn-your-insights model needs a UI layer. The data model is fully built."
        ),
        p("Estimated effort: 1 day."),
        div(),
        todo("Build 'Heat Sharing Settings' section in Profile page"),
        todo("Five toggle switches: Age, Gender, Suburb, Music taste, Vibe ratings"),
        todo("Each toggle: show what it unlocks (e.g. 'See age breakdown of crowds')"),
        todo(
            "Save prefs to Supabase user_heat_prefs table (or localStorage in demo mode)"
        ),
        todo("Wire getVenueInsights(venue, prefs) into VenuePanel"),
        todo("VenuePanel: show locked sections with 'Share your X to unlock' prompts"),
        todo("VenuePanel: animate unlock when user shares a new dimension"),
        todo("VenueMode: gate full analytics behind disclosure_score >= 3"),
        todo(
            "Demo mode: cycle through DEMO_PREFS.nothing / .some / .full to test UI states"
        ),
        div(),
        # ── PHASE 3 ──
        h2("👥 Phase 3 — Social Graph (Friends + Following)"),
        p(
            "The app is social-first. None of this works without real users following each other."
        ),
        p("Estimated effort: 2–3 days."),
        div(),
        todo("Follow/unfollow action — writes to Supabase follows table"),
        todo(
            "Friend request flow — send request → other accepts → both become 'friend' type"
        ),
        todo("Contact sync — hash phone contacts, match against existing users"),
        todo("'People you might know' — surface users from contact matches"),
        todo("Friend Web page — load from Supabase instead of demo data"),
        todo("Profile page — show real RSVP counts, friend count, scene tags"),
        todo("User search — find people by @username or phone number"),
        todo("Follow notifications — 'X started following you'"),
        div(),
        # ── PHASE 4 ──
        h2("🔔 Phase 4 — Notifications + Realtime"),
        p("The feed is only useful if people know when something is happening."),
        p("Estimated effort: 2 days."),
        div(),
        todo(
            "Supabase Realtime subscription on RSVPs — live 'X just said they're going'"
        ),
        todo(
            "Notifications page — render notifications from Supabase notifications table"
        ),
        todo("Mark-as-read mutation"),
        todo("Badge count on Notifications nav item"),
        todo("Event update notification — if an event you RSVPed to changes"),
        todo(
            "Event reminder — push 24h before events you're going to (needs push infra)"
        ),
        todo("Friend RSVP notification — 'Jade K is going to Goodgod tonight'"),
        div(),
        # ── PHASE 5 ──
        h2("📸 Phase 5 — Images + Content"),
        p("Right now all images are Unsplash URLs. Real events need real images."),
        p("Estimated effort: 1 day."),
        div(),
        todo("Supabase Storage bucket: event-images"),
        todo("Supabase Storage bucket: avatars"),
        todo(
            "Image upload in CreateEvent form — compress + upload to Supabase Storage"
        ),
        todo("Avatar upload in Profile — crop to square, upload"),
        todo(
            "Scraper: download + re-host event images from sources (avoid hotlinking)"
        ),
        div(),
        # ── PHASE 6 ──
        h2("🔥 Phase 6 — HEAT Goes Live"),
        p("Right now HEAT is simulated. Phase 6 makes it real."),
        p("This is the most technically ambitious phase."),
        div(),
        todo("Check-in system — user can 'check in' to a venue from HEAT map"),
        todo("Check-in writes: user_id, venue_id, lat/lng, timestamp to Supabase"),
        todo("HEAT map reads live check-in counts from Supabase (not simulated)"),
        todo(
            "Vibe rating prompt — after check-in expires (3h), prompt user to rate the vibe"
        ),
        todo("Vibe ratings aggregate to venue demographics in real time"),
        todo(
            "Progressive demographics: VenuePanel now shows real aggregated data gated by prefs"
        ),
        todo("'At this venue' social layer — show which friends checked in nearby"),
        todo("Realtime subscription on check-ins — venue heat scores update live"),
        todo(
            "Venue claiming — venue owners can claim their venue, get extra analytics"
        ),
        div(),
        # ── PHASE 7 ──
        h2("🤖 Phase 7 — Agent Goes Live"),
        p("The in-app agent currently uses scripted demo responses."),
        p("This phase wires it to a real Claude endpoint."),
        div(),
        todo("Build Claude agent HTTP endpoint (on superlocal or Fly.io)"),
        todo("Agent context: inject user's RSVPs, friends' RSVPs, upcoming events"),
        todo(
            "Agent tools: search_events, get_rsvps, list_friends_going, recommend_events"
        ),
        todo("Wire VITE_AGENT_URL in .env to the live endpoint"),
        todo("Rate limiting — prevent abuse, cap per-user requests"),
        todo("Agent can create events on behalf of user (with confirmation step)"),
        div(),
        # ── PHASE 8 ──
        h2("🎟️ Phase 8 — Ticketing Integration"),
        p("Low-fee ticketing is a real differentiator. Most platforms charge 10–15%."),
        p("Target: < 2% platform fee."),
        div(),
        todo("Research: Stripe Connect vs. custom solution"),
        todo("Ticket creation in CreateEvent form — quantity, tiers, price"),
        todo(
            "Stripe Connect: event creator receives funds directly minus platform fee"
        ),
        todo("Ticket purchasing flow in app"),
        todo("Ticket verification at door — QR code scan"),
        todo("Refund/cancellation handling"),
        div(),
        # ── PHASE 9 ──
        h2("🌏 Phase 9 — Scale + Launch"),
        p("Launch phase — real users, real cities, real events."),
        div(),
        todo(
            "Melbourne scene: curate initial event seed + find 5–10 promoters to onboard"
        ),
        todo(
            "Scene pages — e.g. /scene/melbourne-doof — curated feed for a specific scene"
        ),
        todo(
            "PWA — make the app installable (already has manifest.json + service worker)"
        ),
        todo("App Store / Play Store — React Native port or Capacitor wrapper"),
        todo(
            "Press / community outreach — Resident Advisor listing, Facebook group posts"
        ),
        todo("Analytics — Posthog or Plausible for understanding usage"),
        div(),
        # ── FAST WINS ──
        h2("⚡ Fast Wins — Can Do Anytime"),
        p("Small things that improve the experience immediately, no blockers."),
        div(),
        todo(
            "useEvents hook: fix Supabase query — 'date' → 'starts_at' (one-line bug)"
        ),
        todo("Notifications page: render something instead of empty stub"),
        todo("Profile: display scene_tags from user profile"),
        todo("Event cards: add share button (Web Share API)"),
        todo("CreateEvent: add map picker for location (Leaflet click-to-place)"),
        todo("Heat filters: add 'Arts' and 'Doof/Electronic' filter chips"),
        todo("Add more iCal venue feeds to event_scraper.py ICalSource.FEEDS"),
        todo("Add Eventbrite API token to unlock scraper results"),
        todo(
            "Moshtix scraper — major Australian ticketing platform, needs implementation"
        ),
        todo("Oztix scraper — outdoor/festival events, needs implementation"),
    ]


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 2 — WHAT'S BUILT RIGHT NOW (honest current state audit)
# ═══════════════════════════════════════════════════════════════════════════════


def current_state_blocks():
    return [
        callout(
            "Honest audit of every file and feature — what's real, what's demo, what's a stub. "
            "Read this before touching anything. No surprises.",
            "🔍",
            "gray_background",
        ),
        div(),
        h2("🌐 Live App"),
        pl(
            "→ https://fivelidz.github.io/corral/", "https://fivelidz.github.io/corral/"
        ),
        p(
            "Auto-deploys on every push to main via GitHub Actions. No build step needed — just push."
        ),
        div(),
        h2("📁 File-by-File State"),
        div(),
        h3("src/App.tsx"),
        p(
            "Router + providers. Routes: /, /login, /discover, /create, /event/:id, /profile, /notifications, /agent, /heat, /friends"
        ),
        p("Status: ✅ Complete. All routes wired."),
        div(),
        h3("src/lib/demo-data.ts"),
        p(
            "IS_DEMO flag: true when VITE_SUPABASE_URL is not set (i.e. always in current deploy)."
        ),
        p(
            "Contains: DEMO_USER (Alexei), 10 DEMO_PROFILES (Sadiya, Jade, Max, Tom, Mia, Ben, Priya, Leo, Aisha), 10 DEMO_EVENTS (Subsonic, Goodgod, OAF, BODY, Corral Launch, Sunday Jazz, UTS O-Week, Forest Doof, Jade's Birthday, Chinese Laundry), 29 DEMO_RSVPS, 21 DEMO_FOLLOWS, buildSocialGraph() for Friend Web."
        ),
        p("Status: ✅ Rich and complete. Real-feeling data."),
        div(),
        h3("src/lib/heat-data.ts"),
        p(
            "12 Sydney venues (Marquee, Chinese Laundry, Ivy Pool, OAF, Beresford, Newtown Social, Frankie's, Club 77, Cargo Bar, Burdekin, Goodgod, Lansdowne)."
        ),
        p(
            "Each venue: type, capacity, currentUsers, heatScore, genre[], priceRange, demographics (ageGroups, genderSplit, topSuburbs, vibeRatings), activityHistory[12]."
        ),
        p("getHeatmapPoints() — scatter users around venue lat/lng for heatmap layer."),
        p("simulateLiveUpdate() — random ±6% crowd change every 30s."),
        p(
            "getVenueInsights(venue, prefs) — progressive disclosure: returns only what the user has unlocked based on their UserHeatPrefs."
        ),
        p(
            "DEMO_PREFS — three preset disclosure levels for testing: nothing/some/full."
        ),
        p("Status: ✅ Full demo. NOT yet wired to real check-in data."),
        div(),
        h3("src/types/index.ts"),
        p(
            "Core types: Profile, Event, Rsvp, Follow, Notification, FeedPost, FriendSnippet, GraphNode, GraphEdge, SocialGraph."
        ),
        p("Heat types (new, April 14): UserHeatPrefs, VenueInsights, LockedDimension."),
        p("Scraper type (new, April 14): ScrapedEventMeta."),
        p("Status: ✅ Complete. Matches Supabase schema exactly."),
        div(),
        h3("src/contexts/AuthContext.tsx"),
        p("IS_DEMO = true → auto-logs in as DEMO_USER, no OTP needed."),
        p(
            "IS_DEMO = false → full Supabase phone OTP flow. sendOtp(phone) → verifyOtp(phone, token)."
        ),
        p("normalisePhone() — handles 0412345678, 61412345678, +61412345678."),
        p("Status: ✅ Complete. Needs Supabase keys to go live."),
        div(),
        h3("src/contexts/ThemeContext.tsx"),
        p("Light/dark mode. Persists to localStorage. Default: dark."),
        p("Status: ✅ Complete."),
        div(),
        h3("src/hooks/useEvents.ts"),
        p(
            "useEvents(), useEvent(id), useCreateEvent(), useRsvps(), useEventRsvps(eventId), useUpsertRsvp()."
        ),
        p(
            "⚠️ KNOWN BUG: Supabase query uses .order('date') but column is 'starts_at'. Will throw in live mode."
        ),
        p("Demo mode: returns DEMO_EVENTS/DEMO_RSVPS, no network calls."),
        p("Status: ✅ Works in demo. Needs one-line fix for live mode."),
        div(),
        h3("src/pages/Index.tsx"),
        p(
            "Event feed — your social network's events. Filters: All, Tonight, This Week, Free, Doof, Music, Art, Sport."
        ),
        p(
            "Shows friends_going avatars from demo data. In live mode: needs friends query."
        ),
        p("Status: ✅ Works fully in demo."),
        div(),
        h3("src/pages/Discover.tsx"),
        p(
            "All public events — unfiltered. Same cards as Index but no friends overlay."
        ),
        p("Status: ✅ Works."),
        div(),
        h3("src/pages/Heat.tsx"),
        p(
            "Full HEAT map experience. Leaflet map + heatmap layer + venue markers. Filter chips. Live simulation every 30s. Bottom strip of venue cards sorted by heat score. Taps open VenuePanel → VenueMode."
        ),
        p("Status: ✅ Full demo. Visually complete."),
        div(),
        h3("src/components/heat/VenuePanel.tsx"),
        p(
            "Slide-up bottom sheet: heat score badge, live stats grid (here now / capacity / heat), what's on tonight, capacity bar, activity sparkline (12h), vibe ratings bars, age groups strip, genre tags, description, 'Venue Mode' CTA."
        ),
        p(
            "⚠️ Progressive demographics NOT yet wired. Shows all data regardless of user prefs."
        ),
        p("Status: ✅ Visual complete. Needs getVenueInsights() wired in Phase 2."),
        div(),
        h3("src/components/heat/VenueMode.tsx"),
        p(
            "Full-screen analytics: key stats grid, activity graph with capacity line, gender split donut chart, age groups donut chart, suburb origin bars, vibe ratings, genre tags, consent footer."
        ),
        p(
            "⚠️ Same as VenuePanel — shows all data unconditionally. Needs progressive gating."
        ),
        p("Status: ✅ Visual complete. Needs Phase 2 gating."),
        div(),
        h3("src/pages/FriendWeb.tsx"),
        p(
            "Canvas-based force-directed graph. Purple=you, blue=mutual friends, teal=following, grey=friend-of-friend. Amber edges=shared events. Click node → shows their events + shared events. Filter: all/friends/going."
        ),
        p("Status: ✅ Works in demo. Needs Supabase social graph in Phase 3."),
        div(),
        h3("src/pages/Agent.tsx"),
        p(
            "Chat UI. Demo: pattern-matched scripted replies with 500–1200ms fake delay. Live: POSTs to VITE_AGENT_URL with {message} and reads {reply}."
        ),
        p(
            "Quick prompts: What's on this week? / Who's going tonight? / Any free events? / Best doof?"
        ),
        p("Status: ✅ Demo complete. Needs Claude endpoint in Phase 7."),
        div(),
        h3("src/pages/Profile.tsx"),
        p(
            "Shows user email, member since date, three stat placeholders (Going/Interested/Friends all show '—'), sign out button."
        ),
        p(
            "Status: ⚠️ Stub. Needs real data + scene tags + sharing settings in Phase 2/3."
        ),
        div(),
        h3("src/pages/Notifications.tsx"),
        p("Empty stub — just shows 'No notifications yet'."),
        p("Status: ⚠️ Stub. Needs Phase 4."),
        div(),
        h3("src/pages/Login.tsx"),
        p(
            "Phone number input → OTP code input → signs in. In demo mode: skip button goes straight to feed."
        ),
        p("Status: ✅ Works. Needs Supabase to test real OTP."),
        div(),
        h3("scripts/setup_supabase.sql"),
        p(
            "Full database schema: profiles, follows, events, event_series, rsvps, event_invites, notifications, vibe_ratings, contact_hashes, scraped_events (April 14 new), user_heat_prefs (April 14 new)."
        ),
        p(
            "Includes: RLS policies, indexes, triggers (auto-create profile on signup), realtime publication, views (events_with_counts)."
        ),
        p("Status: ✅ Complete. Run in Supabase SQL editor."),
        div(),
        h3("scripts/event_scraper.py"),
        p(
            "Scrapes Eventbrite (needs API token), Resident Advisor (scrapes HTML), Humanitix (scrapes API), iCal feeds."
        ),
        p("FuzzyDedup: deduplicates by exact fingerprint and fuzzy title+date match."),
        p("SupabaseUpserter: uses service role key + bot user UUID to insert."),
        p("Usage: python3 scripts/event_scraper.py --city Sydney --days 14 --dry-run"),
        p(
            "Status: ✅ Framework complete. Needs SUPABASE_SERVICE_KEY + EVENTBRITE_TOKEN to run live."
        ),
        div(),
        h3("scripts/notion_*.py"),
        p(
            "notion_full_update.py — initial workspace build (April 13). Creates all sub-pages."
        ),
        p(
            "notion_poll_feedback.py — polls Sadiya's page for new content, appends to Ideas Log."
        ),
        p("notion_april14_update.py — logs April 14 session to Ideas Log."),
        p("notion_master_docs.py — THIS SCRIPT. Full documentation rebuild."),
        p("Status: ✅ All operational. Run with NOTION_TOKEN=ntn_xxx."),
    ]


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 3 — HOW IT ALL WORKS (architecture + data flow)
# ═══════════════════════════════════════════════════════════════════════════════


def architecture_blocks():
    return [
        callout(
            "Architecture, data flow, and key design decisions explained. "
            "Why things are built the way they are.",
            "⚙️",
            "gray_background",
        ),
        div(),
        h2("🏗️ System Overview"),
        p("Corral is a mobile-first web app (PWA) built on React. It has two modes:"),
        li(
            "Demo mode: runs entirely in the browser with hardcoded data. No backend. No auth. Anyone can see it."
        ),
        li(
            "Live mode: connects to Supabase for auth, data, and realtime. Triggered by VITE_SUPABASE_URL in .env."
        ),
        p(
            "The frontend never talks to a custom server — everything goes through Supabase's REST API and Realtime websocket."
        ),
        div(),
        h2("📐 Frontend Architecture"),
        code(
            "React 19 + TypeScript\n"
            "  ├── BrowserRouter (basename=/corral for GitHub Pages)\n"
            "  ├── QueryClientProvider (TanStack Query v5 — data fetching + caching)\n"
            "  ├── ThemeProvider (light/dark, localStorage)\n"
            "  └── AuthProvider (Supabase session OR demo user)\n\n"
            "Pages: Index, Discover, CreateEvent, EventDetail, Profile,\n"
            "       Notifications, Agent, Heat, FriendWeb, Login\n\n"
            "Components: Navbar, SearchAndFilters, EventCard, DemoBanner,\n"
            "            VenuePanel, VenueMode\n\n"
            "Hooks: useEvents, useEvent, useCreateEvent, useRsvps,\n"
            "       useEventRsvps, useUpsertRsvp\n\n"
            "Lib: supabase.ts (client), demo-data.ts (mock data),\n"
            "     heat-data.ts (venues + progressive model), utils.ts",
            "typescript",
        ),
        div(),
        h2("🗄️ Database Architecture"),
        p("Supabase (PostgreSQL). Row Level Security on every table."),
        code(
            "auth.users                 → Supabase managed. Phone = primary identity.\n"
            "  ↓ trigger: on_auth_user_created\n"
            "public.profiles            → Extended user data. Auto-created on signup.\n"
            "public.follows             → follow/friend_request/friend relationships.\n"
            "public.events              → All events. Public/friends/invite visibility.\n"
            "public.event_series        → Links recurring events or tours.\n"
            "public.rsvps               → going/interested/not_going per user per event.\n"
            "public.event_invites       → invite-only event access by phone or user_id.\n"
            "public.notifications       → In-app notification log.\n"
            "public.vibe_ratings        → Post-event crowd ratings (energy/crowd/music/value).\n"
            "public.contact_hashes      → SHA-256 hashed phone contacts for friend discovery.\n"
            "public.scraped_events      → Provenance tracking for auto-scraped events.\n"
            "public.user_heat_prefs     → Which demographic dimensions a user opts to share.\n\n"
            "Views: events_with_counts  → events + going_count + interested_count\n\n"
            "Realtime: rsvps, notifications, vibe_ratings",
            "sql",
        ),
        div(),
        h2("🔐 Auth Flow"),
        p("Phone-first, no email, no password."),
        num("User enters Australian mobile number (0412 345 678)"),
        num("normalisePhone() converts to E.164 (+61412345678)"),
        num(
            "supabase.auth.signInWithOtp({ phone }) → Twilio sends SMS with 6-digit code"
        ),
        num(
            "User enters code → supabase.auth.verifyOtp({ phone, token, type: 'sms' })"
        ),
        num("Supabase creates auth.users entry (or signs in existing)"),
        num("on_auth_user_created trigger creates public.profiles row"),
        num("Session is 30 days. Persisted to localStorage by Supabase client."),
        p("In demo mode: all of this is skipped. DEMO_USER is injected directly."),
        div(),
        h2("📡 Data Fetching Pattern"),
        p("TanStack Query handles all data fetching, caching, and invalidation."),
        code(
            "// Pattern: demo-first, Supabase second\n"
            "export function useEvents() {\n"
            "  return useQuery<Event[]>({\n"
            "    queryKey: ['events'],\n"
            "    queryFn: async () => {\n"
            "      if (IS_DEMO) return DEMO_EVENTS  // ← always this path right now\n"
            "      const { data, error } = await supabase\n"
            "        .from('events')\n"
            "        .select('*')\n"
            "        .order('starts_at', { ascending: true })  // ← fix: was 'date'\n"
            "      if (error) throw error\n"
            "      return data as Event[]\n"
            "    },\n"
            "  })\n"
            "}",
            "typescript",
        ),
        div(),
        h2("🌡️ HEAT Architecture"),
        p(
            "HEAT is the real-time activity layer. Right now it's simulated. Here's what it looks like live:"
        ),
        num(
            "User opens HEAT page → Leaflet map loads with heatmap layer + venue markers"
        ),
        num(
            "Markers read from Supabase: SELECT venue_id, COUNT(*) FROM check_ins WHERE created_at > now() - '3 hours' GROUP BY venue_id"
        ),
        num(
            "Realtime subscription on check_ins table → map updates when someone checks in"
        ),
        num(
            "User can check in → writes to check_ins → triggers realtime update for everyone"
        ),
        num("After 3h, check-in expires → vibe rating prompt appears"),
        num("Vibe ratings aggregate to vibe_ratings table → VenueMode shows real data"),
        num(
            "Progressive demographics: VenuePanel calls getVenueInsights(venue, userPrefs) → shows only what user has unlocked"
        ),
        div(),
        h2("🤖 Agent Architecture"),
        p("Two-layer agent concept:"),
        li(
            "Build agent (this): Claude Code in this conversation, building the app. Already happening."
        ),
        li("In-app agent: Claude endpoint POSTed to from the Agent page. User-facing."),
        p("In-app agent planned architecture:"),
        code(
            "# Endpoint: POST VITE_AGENT_URL\n"
            "# Body: { message: string, user_id: string }\n"
            "# Response: { reply: string }\n\n"
            "# Agent context injected per request:\n"
            "# - User's RSVPs (going + interested events)\n"
            "# - Friends' RSVPs (what their network is going to)\n"
            "# - Upcoming public events in their city\n"
            "# - Current time + user's location (if granted)\n\n"
            "# Agent tools:\n"
            "# search_events(query, city, date_range)\n"
            "# get_friends_going(event_id)\n"
            "# recommend_events(user_id, limit)\n"
            "# create_event(title, date, location, ...)\n"
            "# rsvp_event(event_id, status)",
            "python",
        ),
        div(),
        h2("🔄 Event Scraper Architecture"),
        p("Runs on a cron, populates the events table automatically."),
        code(
            "Source classes → scrape(city, days_ahead) → list[ScrapedEvent]\n"
            "  ├── EventbriteSource  (needs EVENTBRITE_TOKEN)\n"
            "  ├── ResidentAdvisorSource  (scrapes __NEXT_DATA__ JSON)\n"
            "  ├── HumanitixSource  (scrapes JSON API)\n"
            "  └── ICalSource  (any .ics feed URL)\n\n"
            "FuzzyDedup → removes duplicates (same source+ID, or same title+date±2h)\n\n"
            "SupabaseUpserter → inserts unique events as bot user\n"
            "  → also writes fingerprint to scraped_events for next-run dedup\n\n"
            "Suggested cron: every 6 hours\n"
            "0 */6 * * * SUPABASE_URL=... SUPABASE_SERVICE_KEY=... python3 scripts/event_scraper.py --city Sydney --days 14",
            "bash",
        ),
        div(),
        h2("🚀 Deploy Architecture"),
        code(
            "git push main\n"
            "  → GitHub Actions: .github/workflows/deploy.yml\n"
            "  → bun install + bun run build\n"
            "  → gh-pages deploy to fivelidz.github.io/corral/\n\n"
            "Build time: ~400ms\n"
            "Deploy time: ~30s\n"
            "Total: < 1 minute from push to live",
            "bash",
        ),
        div(),
        h2("🔑 Environment Variables"),
        code(
            "# .env (never committed)\n\n"
            "# Required for live mode:\n"
            "VITE_SUPABASE_URL=https://xxx.supabase.co\n"
            "VITE_SUPABASE_ANON_KEY=eyJ...\n\n"
            "# Optional:\n"
            "VITE_AGENT_URL=http://localhost:8000/chat\n\n"
            "# Scripts only (not exposed to browser):\n"
            "NOTION_TOKEN=ntn_...\n"
            "SUPABASE_SERVICE_KEY=eyJ...  (service role key, bypasses RLS)\n"
            "SCRAPER_BOT_USER_ID=uuid-of-bot-user\n"
            "EVENTBRITE_TOKEN=your-token",
            "bash",
        ),
    ]


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 4 — PROGRESSIVE DEMOGRAPHICS DEEP DIVE
# ═══════════════════════════════════════════════════════════════════════════════


def progressive_demo_blocks():
    return [
        callout(
            "The core philosophy of HEAT: data equity. "
            "What you contribute is what you get back. "
            "No free riders. No surveillance. Transparent opt-in.",
            "🔒",
            "purple_background",
        ),
        div(),
        h2("💡 The Core Idea"),
        q(
            "If you put in your music preferences, you can see the music preferences of others. "
            "If you share your age range, you can see the age breakdown at venues. "
            "The more you contribute, the more insight you get. "
            "If you share nothing, you see nothing beyond basic heat score."
        ),
        p("This solves three problems at once:"),
        li(
            "Privacy: users only share what they choose to share. Nothing is hidden, nothing is forced."
        ),
        li(
            "Data quality: users who share are invested. Better data in → better data out."
        ),
        li(
            "Fairness: no one gets demographic insights for free. Everyone contributes."
        ),
        div(),
        h2("📊 The Five Dimensions"),
        p(
            "Each is a boolean opt-in in user_heat_prefs table. Disclosure score = sum of all five."
        ),
        div(),
        h3("1. Age Range (share_age)"),
        p(
            "What you share: your age bracket (18–24, 25–32, 33–40, 40+). Not your exact age."
        ),
        p("What you unlock: see the age breakdown of crowds at any venue on the map."),
        p(
            "Why it matters: knowing the crowd's age is one of the most useful signals for 'is this my scene?'"
        ),
        div(),
        h3("2. Gender (share_gender)"),
        p("What you share: your gender identity (from the options in your profile)."),
        p(
            "What you unlock: see gender split at venues. Useful for knowing vibe without being there."
        ),
        p(
            "Note: this is one of the most sensitive dimensions. Always optional, never required."
        ),
        div(),
        h3("3. Home Suburb (share_suburb)"),
        p(
            "What you share: your home suburb (already on your profile for discovery purposes)."
        ),
        p(
            "What you unlock: see the 'where people are coming from' map on HEAT venues."
        ),
        p("This tells you: do I need a taxi home? Will I know anyone from my area?"),
        div(),
        h3("4. Music Taste (share_music)"),
        p(
            "What you share: your scene_tags from profile (e.g. doof, techno, jazz, indie)."
        ),
        p(
            "What you unlock: see what music tastes are represented in the crowd at a venue right now."
        ),
        p("This tells you: will the people there be into similar music?"),
        div(),
        h3("5. Vibe Ratings (share_vibe)"),
        p(
            "What you share: your post-event vibe ratings (energy/crowd/music/value on a 1–10 scale)."
        ),
        p("What you unlock: see aggregated vibe ratings from everyone at venues."),
        p("This is the most valuable dimension — it's also the most work to collect."),
        div(),
        h2("🔢 Disclosure Score Levels"),
        code(
            "score 0 — See: venue name, heat score, is open\n"
            "score 1 — + capacity % (how full is it)\n"
            "score 2 — + age breakdown (if share_age = true)\n"
            "score 3 — + suburb origin (if share_suburb = true)\n"
            "score 4 — + music taste breakdown (if share_music = true)\n"
            "score 5 — + full vibe ratings + gender split (if share_vibe + share_gender = true)\n\n"
            "Note: score is additive but dimensions are conditional — you get the\n"
            "specific dimension you unlocked, not a sequential gate.",
            "plain text",
        ),
        div(),
        h2("🛠️ Implementation"),
        h3("Supabase: user_heat_prefs table"),
        code(
            "create table public.user_heat_prefs (\n"
            "  user_id           uuid primary key references profiles(id),\n"
            "  share_age         boolean default false,\n"
            "  share_gender      boolean default false,\n"
            "  share_suburb      boolean default false,\n"
            "  share_music       boolean default false,\n"
            "  share_vibe        boolean default false,\n"
            "  disclosure_score  smallint generated always as (\n"
            "    share_age::int + share_gender::int + share_suburb::int\n"
            "    + share_music::int + share_vibe::int\n"
            "  ) stored\n"
            ")",
            "sql",
        ),
        p(
            "The GENERATED column means disclosure_score is always accurate — no application-level sync needed."
        ),
        div(),
        h3("TypeScript: getVenueInsights()"),
        code(
            "// src/lib/heat-data.ts\n"
            "export function getVenueInsights(\n"
            "  venue: Venue,\n"
            "  prefs: UserHeatPrefs | null\n"
            "): VenueInsights {\n"
            "  // Always visible\n"
            "  const base = { heatScore, isOpen, currentUsers, capacity }\n\n"
            "  // Each dimension gated by its specific pref\n"
            "  if (prefs?.share_age)    base.ageGroups   = venue.demographics.ageGroups\n"
            "  if (prefs?.share_suburb) base.topSuburbs  = venue.demographics.topSuburbs\n"
            "  if (prefs?.share_music)  base.genreBreakdown = ...\n"
            "  if (prefs?.share_vibe)   base.vibeRatings = venue.demographics.vibeRatings\n"
            "  if (prefs?.share_gender) base.genderSplit  = venue.demographics.genderSplit\n\n"
            "  // Also return what's locked (so UI can show prompts)\n"
            "  base.lockedDimensions = getAllLocked(prefs)\n"
            "  return base\n"
            "}",
            "typescript",
        ),
        div(),
        h2("🎨 UI Pattern for Locked Sections"),
        p(
            "When a dimension is locked, don't hide it — show it with a lock overlay. This makes the value proposition obvious."
        ),
        code(
            "// Locked section pattern\n"
            "<div className='relative'>\n"
            "  <div className='blur-sm pointer-events-none'>\n"
            "    {/* Blurred preview of what the data looks like */}\n"
            "    <FakeAgeBreakdown />\n"
            "  </div>\n"
            "  <div className='absolute inset-0 flex flex-col items-center justify-center'>\n"
            "    <Lock size={20} />\n"
            "    <p>Share your age range to unlock</p>\n"
            "    <button onClick={() => nav('/profile#sharing')}>Share now</button>\n"
            "  </div>\n"
            "</div>",
            "typescript",
        ),
        div(),
        h2("🔮 Future Extensions"),
        li(
            "Temporal dimensions: share your check-in times → unlock when crowds peak at venues"
        ),
        li(
            "Scene affinity: share your top genres → unlock 'what % of this crowd matches your scene'"
        ),
        li(
            "Neighbourhood density: share your location → unlock 'people from your area who go to this'"
        ),
        li(
            "Spending habits: link Stripe → unlock average spend per person at venues (for venue owners)"
        ),
        li(
            "Friend overlap: your network shares going-out frequency → unlock 'how many friends typically here on Fridays'"
        ),
    ]


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 5 — EVENT SCRAPER GUIDE
# ═══════════════════════════════════════════════════════════════════════════════


def scraper_guide_blocks():
    return [
        callout(
            "The event scraper auto-populates Corral with real events from multiple sources. "
            "This guide covers setup, operation, and extending it with new sources.",
            "🕷️",
            "gray_background",
        ),
        div(),
        h2("🚀 Quick Start"),
        code(
            "# 1. Install Python dependencies\n"
            "pip install --target=/home/fivelidz/.local/lib/python3.11/site-packages \\\n"
            "  requests beautifulsoup4 python-dateutil icalendar\n\n"
            "# 2. Set environment variables\n"
            "export SUPABASE_URL=https://xxx.supabase.co\n"
            "export SUPABASE_SERVICE_KEY=eyJ...  # service role key (not anon)\n"
            "export SCRAPER_BOT_USER_ID=uuid     # UUID of the bot user in Supabase Auth\n"
            "export EVENTBRITE_TOKEN=xxx          # optional but recommended\n\n"
            "# 3. Dry run (no inserts)\n"
            "python3 scripts/event_scraper.py --city Sydney --days 14 --dry-run\n\n"
            "# 4. Live run\n"
            "python3 scripts/event_scraper.py --city Sydney --days 14\n\n"
            "# 5. Specific sources\n"
            "python3 scripts/event_scraper.py --sources ra,humanitix --city Melbourne",
            "bash",
        ),
        div(),
        h2("📦 Sources"),
        h3("Eventbrite"),
        p("Uses the official Eventbrite REST API. Free tier: 2000 calls/day."),
        p("Get token: eventbrite.com/platform/api → 'Create API Key' → Private Token"),
        p("Set: export EVENTBRITE_TOKEN=your-private-token"),
        p("Without token: source skips with a warning."),
        div(),
        h3("Resident Advisor (RA)"),
        p("Scrapes the __NEXT_DATA__ JSON embedded in RA event listing pages."),
        p("RA is the definitive source for electronic music events globally."),
        p("City slugs available: au/sydney, au/melbourne, au/brisbane, au/perth"),
        p(
            "Limitation: RA may rate-limit or block scrapers. If getting 403s, add delay between requests."
        ),
        p("Long-term: consider RA's official data partnership for commercial use."),
        div(),
        h3("Humanitix"),
        p(
            "Australian ticketing platform that donates 100% of booking fees to charity."
        ),
        p("Scrapes their internal JSON API."),
        p("Note: API path may need updating if Humanitix changes their frontend."),
        div(),
        h3("iCal Feeds"),
        p(
            "Any venue with a .ics feed can be added to ICalSource.FEEDS dict in the script."
        ),
        p("Format: 'Venue Name': 'https://venue.com/events.ics'"),
        p("Many venues publish these — check their website footer or contact page."),
        div(),
        h2("🤖 Bot User Setup"),
        p(
            "The scraper creates events 'on behalf of' a bot user. This is how to set that up:"
        ),
        num("Go to Supabase Auth → Users → Invite user"),
        num("Or: INSERT directly into auth.users for a service account"),
        num("Copy the UUID from the created user"),
        num("Set: export SCRAPER_BOT_USER_ID=that-uuid"),
        p(
            "The bot user should have a profile with display_name = 'Corral Bot' or 'Scraped Event'."
        ),
        p(
            "Users can see that an event came from the scraper (vs a real person) by the creator profile."
        ),
        div(),
        h2("➕ Adding a New Source"),
        code(
            "class MoshtixSource:\n"
            "    NAME = 'moshtix'\n\n"
            "    def scrape(self, city: str, days_ahead: int = 14) -> list[ScrapedEvent]:\n"
            "        # Scrape moshtix.com.au for city events\n"
            "        events = []\n"
            "        url = f'https://www.moshtix.com.au/v2/search?query=&state={city_to_state(city)}'\n"
            "        # ... fetch, parse, return ScrapedEvent list\n"
            "        return events\n\n"
            "# Register it:\n"
            "ALL_SOURCES = {\n"
            "    'eventbrite': EventbriteSource,\n"
            "    'ra':         ResidentAdvisorSource,\n"
            "    'humanitix':  HumanitixSource,\n"
            "    'ical':       ICalSource,\n"
            "    'moshtix':    MoshtixSource,   # ← add here\n"
            "}",
            "python",
        ),
        div(),
        h2("⏰ Recommended Cron Schedule"),
        code(
            "# Edit crontab: crontab -e\n\n"
            "# Every 6 hours — main scrape\n"
            "0 */6 * * * SUPABASE_URL=... SUPABASE_SERVICE_KEY=... SCRAPER_BOT_USER_ID=... \\\n"
            "  python3 /home/fivelidz/projects/corral_project/scripts/event_scraper.py \\\n"
            "  --city Sydney --days 14 >> /tmp/corral-scraper.log 2>&1\n\n"
            "# Every hour — Melbourne too\n"
            "0 * * * * SUPABASE_URL=... SUPABASE_SERVICE_KEY=... SCRAPER_BOT_USER_ID=... \\\n"
            "  python3 /home/fivelidz/projects/corral_project/scripts/event_scraper.py \\\n"
            "  --city Melbourne --days 14 --sources ra,humanitix >> /tmp/corral-scraper.log 2>&1",
            "bash",
        ),
        div(),
        h2("🔮 Sources to Add"),
        li("Moshtix — major Australian ticketing (metal, rock, alt, big shows)"),
        li("Oztix — outdoor, festival, alternative events"),
        li("Ticketmaster AU — mainstream large venues"),
        li("Try Booking — smaller, independent events"),
        li("Facebook Events — hardest due to anti-scraping, but biggest source"),
        li(
            "Instagram — event posts from venue accounts, needs NLP to extract date/location"
        ),
        li(
            "Specific venue websites — Metro Theatre, Manning Bar, Hordern Pavilion, etc."
        ),
        li("Meetup.com — community events, not just music"),
    ]


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 6 — OPEN PROBLEMS + BRAINSTORM
# ═══════════════════════════════════════════════════════════════════════════════


def brainstorm_blocks():
    return [
        callout(
            "Unsolved design questions, open problems, and ideas that haven't been decided yet. "
            "These are things worth thinking about — not todos, not specs. Just open thinking.",
            "🧠",
            "yellow_background",
        ),
        div(),
        h2("❓ Open Design Questions"),
        div(),
        h3("1. What is the feed algorithm?"),
        p("Current decision: chronological + social graph only. No ranking, no ML."),
        p(
            "The problem: as the platform grows, people's networks get big. The feed becomes overwhelming."
        ),
        p("Options being considered:"),
        li("Pure chronological — simple, transparent, predictable"),
        li("Social-weighted — events with more friends going rank higher"),
        li("Scene-weighted — events that match your scene_tags surface first"),
        li("Distance-weighted — events closer to you rank higher"),
        p(
            "Hypothesis: scene-weighted + distance is the right balance. Keeps it relevant without being algorithmic."
        ),
        p(
            "Open question: does ranking betray the 'no algorithm' philosophy? Or is scene filtering just personalisation?"
        ),
        div(),
        h3("2. How private should private events be?"),
        p("Current visibility options: public / friends / invite."),
        p(
            "The problem: a 'friends-only' doof in the Blue Mountains. You want 100 people but not thousands. But 'friends' means anyone who follows the host."
        ),
        p("Edge cases:"),
        li("What if the host has 2000 followers? 'Friends' is basically public."),
        li(
            "What if it's a genuinely secret event? The invite-only option exists, but managing invites is friction."
        ),
        li("How does venue-mode HEAT show secret events? It shouldn't."),
        p(
            "Possible solution: capacity cap on visibility. 'Friends-only' events stop showing new RSVPs at X."
        ),
        div(),
        h3("3. How do we handle venue-owner data access?"),
        p("VenueMode shows patron demographics. Who has access to this?"),
        li("Currently: everyone (bad, this should be gated)"),
        li("Option A: venue owners get a special account type with richer analytics"),
        li(
            "Option B: the full VenueMode view is only for users with disclosure_score = 5"
        ),
        li(
            "Option C: basic VenueMode for users, rich VenueMode for venues (venue dashboard product)"
        ),
        p(
            "This is also a monetisation question. Venue analytics could be a paid product."
        ),
        div(),
        h3("4. What's the check-in mechanic?"),
        p("HEAT needs check-ins to be real. But check-ins are annoying."),
        p("Ideas:"),
        li("Tap a button on the HEAT map when you arrive at a venue"),
        li("Auto-detect via GPS (battery drain, privacy concern)"),
        li("NFC tap at venue entrance (requires hardware)"),
        li("QR code at venue entrance (works on any phone, low friction)"),
        li(
            "RSVP-to-check-in: if you RSVPed 'going' and it's event time, auto check-in"
        ),
        p(
            "Best answer probably: RSVP-based auto check-in + manual override. No GPS polling."
        ),
        div(),
        h3("5. How does friend discovery actually work?"),
        p("Current plan: hash your phone contacts, match against existing users."),
        p("Problems:"),
        li("Requires contact permission — users don't like giving it"),
        li("Not everyone you want to follow is in your contacts"),
        li("What about people who haven't signed up yet?"),
        p("Better approach: multi-signal discovery"),
        li("Contact matching (optional, high trust)"),
        li(
            "Shared event attendance (you both RSVPed 'going' to same events → suggest follow)"
        ),
        li("Scene tag overlap (you share 3+ scene tags → suggest follow)"),
        li("Username search (opt-in, user shares their handle)"),
        div(),
        h3("6. Should there be a web version and a native app?"),
        p("Current: PWA (installable web app). Works on any browser."),
        p("Arguments for staying PWA:"),
        li("Faster to iterate — no app store review delays"),
        li("Works on any device instantly"),
        li("Lower maintenance (one codebase)"),
        p("Arguments for going native:"),
        li("Push notifications are unreliable on PWA (especially iOS)"),
        li("Camera access for photo uploads is more reliable native"),
        li("App Store presence = discoverability"),
        p(
            "Likely path: PWA first, React Native later (Expo, sharing most business logic)."
        ),
        div(),
        h2("💡 Ideas Parked for Later"),
        div(),
        h3("Scene Pages"),
        p(
            "Curated feeds for specific scenes. /scene/melbourne-doof, /scene/sydney-queer, /scene/brisbane-jazz."
        ),
        p(
            "Curation model: community-maintained, not algorithmic. Moderators vote on what's in the scene."
        ),
        p(
            "This could be a major growth driver — scene communities are highly motivated."
        ),
        div(),
        h3("Post-Event Photos"),
        p(
            "'I was there' — photo drops after events. A social layer that doesn't exist elsewhere."
        ),
        p(
            "Not Instagram (public, curated, performative) — more like a private album for people who attended."
        ),
        p(
            "Gated by RSVP: you have to have 'going' to post photos. Reduces random uploads."
        ),
        div(),
        h3("NFP / Organisational Structure"),
        p(
            "The scene mission (low-fee, community-owned, transparent) aligns with an NFP structure."
        ),
        p(
            "Could make grant applications possible (arts funding, community development)."
        ),
        p(
            "Also aligns with the data equity philosophy — an NFP doesn't have the same pressure to monetise data."
        ),
        p("Worth a formal legal consultation before launch."),
        div(),
        h3("Swipe RSVP"),
        p(
            "Tinder-style event cards. Swipe right = interested, left = skip, up = going."
        ),
        p(
            "Great for discovery mode. Not the primary feed — a secondary 'browse' mode."
        ),
        div(),
        h3("Artist/Promoter Profiles"),
        p("Follow a promoter → get notified when they announce events."),
        p("Follow an artist → get notified when they tour Australia."),
        p("Connects directly to the scraper — RA has rich artist data."),
        div(),
        h3("Lineup Builder for Doofs"),
        p(
            "Doof promoters need to manage lineups. A simple builder that creates a public lineup page."
        ),
        p("Shareable link → embeds in Facebook events, RA listings, etc."),
        p("This is a tool for promoters, not users. Different UX context."),
        div(),
        h2("🧪 Experiments Worth Running"),
        li("A/B test: chronological vs scene-weighted feed — which gets more RSVPs?"),
        li(
            "Progressive demographics unlock rate — do users actually share, or does it stall at 0?"
        ),
        li(
            "Check-in prompt timing — right when event starts vs 1h in vs next morning?"
        ),
        li(
            "'Friends going' visibility — does seeing friends' RSVPs increase your own RSVP rate?"
        ),
        li(
            "Agent usage — what questions do users actually ask? Informs which tools to build."
        ),
    ]


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 7 — UPDATED PROJECT STATUS (replaces old)
# ═══════════════════════════════════════════════════════════════════════════════


def status_blocks():
    return [
        callout(
            "Live as of April 14 2026. Full demo mode — no backend required.\n"
            "Auto-deploys on every git push to main.\n"
            "Last major update: Progressive demographics model + event scraper.",
            "🟢",
            "green_background",
        ),
        div(),
        h2("🔗 Links"),
        pl("🌐  Live demo", "https://fivelidz.github.io/corral/"),
        pl("💻  GitHub", "https://github.com/fivelidz/corral"),
        pl(
            "📓  Notion Hub",
            "https://www.notion.so/Corral-Events-Social-App-3417463480e9816b9709ecbe766da873",
        ),
        pl(
            "👋  Sadiya's page",
            "https://www.notion.so/Sadiya-Corral-Collab-Space-3417463480e981108ed6d2b02ebb32d4",
        ),
        div(),
        h2("✅ What's Working Now"),
        todo("React 19 + Vite 8 + TypeScript — clean build, zero errors", True),
        todo("Tailwind v4 @theme tokens — full light + dark mode", True),
        todo(
            "Demo mode — 10 events, 10 users, mock RSVPs/follows — works with no backend",
            True,
        ),
        todo("Event feed with search + 7 filter chips", True),
        todo("Event cards — RSVP toggle, friend avatars, price, tags", True),
        todo("Event detail page", True),
        todo("Create event form", True),
        todo("Discover page", True),
        todo("Profile + sign out", True),
        todo("Agent chat with demo responses + live endpoint hook", True),
        todo(
            "HEAT map — Leaflet + heatmap, 12 venues, live sim, venue panel, venue mode",
            True,
        ),
        todo("Friend Web — force-directed social graph canvas", True),
        todo("Full Supabase schema (16 tables, RLS, realtime)", True),
        todo(
            "Progressive demographics model — data + types + getVenueInsights()", True
        ),
        todo("Event scraper framework — 4 sources, dedup, Supabase upserter", True),
        todo("GitHub Actions auto-deploy on push to main", True),
        todo("Notion workspace + scripts", True),
        div(),
        h2("🚧 Not Yet Built (phase-by-phase)"),
        todo("Phase 1: Supabase connected — needs VITE_SUPABASE_URL"),
        todo("Phase 1: Scraper running live — needs SERVICE_KEY + BOT_USER_ID"),
        todo("Phase 2: Progressive demographics UI in VenuePanel"),
        todo("Phase 2: Heat sharing settings in Profile"),
        todo("Phase 3: Real social graph — follows, friends, contact sync"),
        todo("Phase 4: Notifications + Realtime subscriptions"),
        todo("Phase 5: Image upload to Supabase Storage"),
        todo("Phase 6: Real check-ins feeding HEAT data"),
        todo("Phase 7: Claude agent endpoint wired up"),
        todo("Phase 8: Ticketing integration"),
        todo("Phase 9: Launch + scale"),
        div(),
        h2("⚙️ Tech Stack"),
        code(
            "Frontend:    React 19 + TypeScript + Vite 8\n"
            "Styling:     Tailwind CSS v4 (@theme tokens, full light+dark)\n"
            "Routing:     React Router v7\n"
            "Data:        TanStack Query v5\n"
            "Map:         Leaflet + leaflet.heat\n"
            "Graph:       Custom canvas force-directed layout\n"
            "Backend:     Supabase (PostgreSQL + Auth + Realtime + Storage)\n"
            "Icons:       Lucide React\n"
            "Deploy:      GitHub Pages via Actions (auto on push to main)\n"
            "Collab:      Notion API (this workspace)\n"
            "Scraper:     Python 3 (requests, bs4, dateutil)\n"
            "Local dev:   ~/projects/corral_project  (superlocal)",
        ),
        div(),
        h2("🏃 How to Run"),
        code(
            "cd ~/projects/corral_project\n"
            "bun dev              # dev server at localhost:5173/corral/\n"
            "bun run build        # production build\n"
            "bun run preview      # preview production build\n"
            "git push             # triggers GitHub Actions deploy\n\n"
            "# Notion scripts:\n"
            "NOTION_TOKEN=ntn_xxx python3 scripts/notion_poll_feedback.py\n"
            "NOTION_TOKEN=ntn_xxx python3 scripts/notion_master_docs.py\n\n"
            "# Scraper (once Supabase is wired):\n"
            "python3 scripts/event_scraper.py --dry-run --city Sydney",
            "bash",
        ),
        div(),
        h2("🐛 Known Bugs"),
        li(
            "useEvents hook: .order('date') should be .order('starts_at') — one-line fix, low priority in demo mode"
        ),
        li(
            "VenuePanel + VenueMode: shows all demographics unconditionally — Phase 2 will gate this"
        ),
        li(
            "Profile stats: Going/Interested/Friends all show '—' — needs Supabase query"
        ),
        li(
            "RA scraper: 403 in testing — UA string improved, needs retry in production"
        ),
        li(
            "Eventbrite scraper: returns 0 without EVENTBRITE_TOKEN — expected, add token to unlock"
        ),
    ]


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("\n📚 Corral Master Documentation Build\n")
    print("Creating documentation sub-pages under Hub...\n")

    pages_created = []

    print("1. Master Roadmap...")
    p1 = create_page(HUB_ID, "🗺️ Master Roadmap", "🗺️", roadmap_blocks())
    pages_created.append(("🗺️ Master Roadmap", p1["url"]))

    print("2. Current State Audit...")
    p2 = create_page(
        HUB_ID, "🔍 Current State — What's Built", "🔍", current_state_blocks()
    )
    pages_created.append(("🔍 Current State — What's Built", p2["url"]))

    print("3. Architecture...")
    p3 = create_page(HUB_ID, "⚙️ How It All Works", "⚙️", architecture_blocks())
    pages_created.append(("⚙️ How It All Works", p3["url"]))

    print("4. Progressive Demographics...")
    p4 = create_page(
        HUB_ID,
        "🔒 Progressive Demographics — Earn Your Insights",
        "🔒",
        progressive_demo_blocks(),
    )
    pages_created.append(("🔒 Progressive Demographics", p4["url"]))

    print("5. Event Scraper Guide...")
    p5 = create_page(HUB_ID, "🕷️ Event Scraper Guide", "🕷️", scraper_guide_blocks())
    pages_created.append(("🕷️ Event Scraper Guide", p5["url"]))

    print("6. Open Problems + Brainstorm...")
    p6 = create_page(HUB_ID, "🧠 Open Problems + Brainstorm", "🧠", brainstorm_blocks())
    pages_created.append(("🧠 Open Problems + Brainstorm", p6["url"]))

    print("7. Project Status (updating)...")
    # Find existing status page and update it, or create fresh
    existing = notion.blocks.children.list(HUB_ID)
    status_id = None
    for block in existing.get("results", []):
        if block.get("type") == "child_page":
            title = block["child_page"].get("title", "")
            if "Status" in title or "🟢" in title:
                status_id = block["id"]
                break

    if status_id:
        clear_and_rewrite(status_id, status_blocks())
        print(f"  ✅ Project Status (updated existing)")
        pages_created.append(
            ("🟢 Project Status", f"https://notion.so/{status_id.replace('-', '')}")
        )
    else:
        p7 = create_page(HUB_ID, "🟢 Project Status", "🟢", status_blocks())
        pages_created.append(("🟢 Project Status", p7["url"]))

    # Append index of new pages to Hub
    print("\n8. Updating Hub index...")
    index_blocks = [
        div(),
        {
            "object": "block",
            "type": "heading_2",
            "heading_2": {
                "rich_text": [
                    {
                        "type": "text",
                        "text": {"content": "📚 Documentation (April 14 2026)"},
                    }
                ]
            },
        },
    ]
    for title, url in pages_created:
        index_blocks.append(
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {"content": title, "link": {"url": url}},
                        }
                    ]
                },
            }
        )
    notion.blocks.children.append(HUB_ID, children=index_blocks)
    print("  ✅ Hub index updated")

    print("\n✅ All done!\n")
    print(
        f"Hub: https://www.notion.so/Corral-Events-Social-App-{HUB_ID.replace('-', '')}\n"
    )
    print("Pages created:")
    for title, url in pages_created:
        print(f"  {title}")
        print(f"    {url}")
