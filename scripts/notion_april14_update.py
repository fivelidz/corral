#!/usr/bin/env python3
"""
Notion update — April 14 2026 session.
Appends new ideas to the Ideas Log:
  - Event scraper (general auto-ingestion tool)
  - Progressive demographics model for Heat

Run: NOTION_TOKEN=ntn_xxx python3 scripts/notion_april14_update.py
"""

import sys, os

sys.path.insert(0, "/home/fivelidz/.local/lib/python3.11/site-packages")
from notion_client import Client

TOKEN = os.environ.get("NOTION_TOKEN")
if not TOKEN:
    print("ERROR: set NOTION_TOKEN env var")
    sys.exit(1)

HUB_ID = "3417463480e9816b9709ecbe766da873"

notion = Client(auth=TOKEN)


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


def li(t):
    return {
        "object": "block",
        "type": "bulleted_list_item",
        "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": t}}]},
    }


def div():
    return {"object": "block", "type": "divider", "divider": {}}


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


# ── Find the Ideas Log sub-page ───────────────────────────────────────────────
def find_ideas_log():
    children = notion.blocks.children.list(HUB_ID)
    for block in children.get("results", []):
        if block.get("type") == "child_page":
            title = block["child_page"].get("title", "")
            if "Ideas" in title and "Log" in title:
                return block["id"]
    return None


new_blocks = [
    div(),
    h2("🗓️ April 14 2026"),
    h3("💡 From Alexei"),
    pb("General Event Scraper — auto-populate events into Corral"),
    p(
        "Built a general-purpose event ingestion tool (scripts/event_scraper.py). "
        "Scrapes multiple sources and normalises into the Supabase events table. "
        "Designed to be extended: add a new Source class for any new site."
    ),
    p("Sources implemented:"),
    li("Eventbrite — public API, covers mainstream events, free tier 2000 calls/day"),
    li(
        "Resident Advisor (RA) — scrapes __NEXT_DATA__ JSON blob, electronic music gold standard"
    ),
    li(
        "Humanitix — Australian ticketing platform (ethical/charity-donation model), scrapes API"
    ),
    li("Generic iCal/ICS feeds — any venue that publishes a .ics feed can be added"),
    p("Architecture:"),
    li("Each source = a class with scrape(city, days_ahead) -> list[ScrapedEvent]"),
    li("Fuzzy deduplication: exact (source+ID) + fuzzy (title+date within 2h+city)"),
    li(
        "scraped_events tracking table in Supabase stores fingerprints to avoid re-inserting"
    ),
    li(
        "Bot user: scraper creates events as a designated bot UUID (SCRAPER_BOT_USER_ID env var)"
    ),
    li("Service role key bypasses RLS so the bot can insert"),
    p("Usage:"),
    code(
        "pip install requests beautifulsoup4 python-dateutil supabase icalendar\n\n"
        "export SUPABASE_URL=https://xxx.supabase.co\n"
        "export SUPABASE_SERVICE_KEY=your-service-role-key\n"
        "export SCRAPER_BOT_USER_ID=uuid-of-bot-user\n"
        "export EVENTBRITE_TOKEN=optional-improves-results\n\n"
        "python3 scripts/event_scraper.py --city Sydney --days 14\n"
        "python3 scripts/event_scraper.py --dry-run   # test without inserting\n"
        "python3 scripts/event_scraper.py --sources ra,humanitix  # specific sources",
        "bash",
    ),
    p("→ Status: ✅ Built. Needs Supabase to be wired up before running for real."),
    div(),
    pb("Progressive demographics for Heat — earn your insights"),
    p(
        "Core mechanic: what you share about yourself determines what you can see about others. "
        "This is the data equity model — no free riders. "
        "If you put in your music preferences, you can see the music preferences of others at venues. "
        "If you share nothing, you see nothing (beyond basic heat score)."
    ),
    p("Disclosure dimensions (each is a boolean opt-in):"),
    li("share_age   → unlock: see age breakdown of crowds at venues"),
    li("share_gender → unlock: see gender split at venues"),
    li("share_suburb → unlock: see where people are coming from (suburb heatmap)"),
    li("share_music  → unlock: see music taste breakdown at venues"),
    li(
        "share_vibe   → submit vibe ratings after events → unlock: see vibe ratings of others"
    ),
    p("disclosure_score = sum of all 5 booleans (0–5). Gates what Heat shows you:"),
    li("0 — venue name + heat score only"),
    li("1 — + capacity % (crowd fullness)"),
    li("2 — + age breakdown (if share_age = true)"),
    li("3 — + suburb origin map (if share_suburb = true)"),
    li("4 — + music taste breakdown (if share_music = true)"),
    li("5 — + full vibe ratings + gender split (if share_vibe + share_gender = true)"),
    p(
        "The UI shows locked sections with 'Share your X to unlock this' — transparent and incentive-aligned."
    ),
    p("Implementation:"),
    li(
        "New Supabase table: public.user_heat_prefs (user_id, share_*, disclosure_score GENERATED)"
    ),
    li("New TS types: UserHeatPrefs, VenueInsights, LockedDimension"),
    li("New function: getVenueInsights(venue, prefs) → VenueInsights"),
    li("Demo prefs: DEMO_PREFS.nothing / .some / .full for testing in demo mode"),
    p(
        "→ Status: ✅ Data model built, types written, SQL schema updated. UI gating to build next."
    ),
    div(),
    h3("📐 Design Decisions Made — April 14"),
    li("Event scraper: bot creates events as a dedicated UUID, not as a real user"),
    li("Progressive demographics: opt-in per-dimension, not all-or-nothing"),
    li(
        "Locked UI: show what's locked + what sharing unlocks it — transparency builds trust"
    ),
    li(
        "Supabase: disclosure_score is a GENERATED column (sum of booleans) — always consistent"
    ),
    li(
        "scraped_events table: separate from events table, tracks source provenance + prevents dedup"
    ),
    div(),
    h3("🔮 Next Up"),
    li("Wire progressive demographics into VenuePanel UI (show locked sections)"),
    li("Build 'Your Sharing Settings' screen in Profile"),
    li(
        "Set up Supabase project and run schema (still blocked on Q2 from Questions page)"
    ),
    li("Test scraper dry-run against Eventbrite + RA + Humanitix"),
    li("Add more venue iCal feeds to ICalSource.FEEDS"),
]


if __name__ == "__main__":
    print("\n📋 Corral Notion Update — April 14 2026\n")

    ideas_log_id = find_ideas_log()
    if not ideas_log_id:
        print("❌ Could not find Ideas & Changes Log sub-page under Hub.")
        print("   Run notion_full_update.py first to create it.")
        sys.exit(1)

    print(f"Found Ideas Log: {ideas_log_id}")
    print("Appending April 14 update...")

    for i in range(0, len(new_blocks), 100):
        notion.blocks.children.append(ideas_log_id, children=new_blocks[i : i + 100])
        print(f"  Appended blocks {i + 1}–{i + len(new_blocks[i : i + 100])}")

    print("\n✅ Done! Ideas Log updated.")
    print(f"   View: https://www.notion.so/{ideas_log_id.replace('-', '')}")
