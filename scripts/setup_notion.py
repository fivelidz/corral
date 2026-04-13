#!/usr/bin/env python3
"""
Full Corral Notion workspace setup.
Creates a rich Corral Hub page inside the Idea Bank with project write-up,
roadmap, ideas tracker, and all relevant links.
"""

import sys

sys.path.insert(0, "/home/fivelidz/.local/lib/python3.11/site-packages")

import os
from notion_client import Client

TOKEN = os.environ.get("NOTION_TOKEN")
if not TOKEN:
    print("ERROR: Set NOTION_TOKEN environment variable")
    print("  export NOTION_TOKEN=ntn_xxx...")
    sys.exit(1)
IDEA_BANK_ID = "3407463480e980f99066f861ede25ba3"

notion = Client(auth=TOKEN)

# ── Block helpers ─────────────────────────────────────────────────────────────


def h1(text):
    return {
        "object": "block",
        "type": "heading_1",
        "heading_1": {"rich_text": [{"type": "text", "text": {"content": text}}]},
    }


def h2(text):
    return {
        "object": "block",
        "type": "heading_2",
        "heading_2": {"rich_text": [{"type": "text", "text": {"content": text}}]},
    }


def h3(text):
    return {
        "object": "block",
        "type": "heading_3",
        "heading_3": {"rich_text": [{"type": "text", "text": {"content": text}}]},
    }


def p(text):
    return {
        "object": "block",
        "type": "paragraph",
        "paragraph": {"rich_text": [{"type": "text", "text": {"content": text}}]},
    }


def p_link(text, url):
    return {
        "object": "block",
        "type": "paragraph",
        "paragraph": {
            "rich_text": [
                {"type": "text", "text": {"content": text, "link": {"url": url}}}
            ]
        },
    }


def bullet(text, bold=False):
    anno = {"bold": True} if bold else {}
    return {
        "object": "block",
        "type": "bulleted_list_item",
        "bulleted_list_item": {
            "rich_text": [
                {"type": "text", "text": {"content": text}, "annotations": anno}
            ]
        },
    }


def numbered(text):
    return {
        "object": "block",
        "type": "numbered_list_item",
        "numbered_list_item": {
            "rich_text": [{"type": "text", "text": {"content": text}}]
        },
    }


def todo(text, checked=False):
    return {
        "object": "block",
        "type": "to_do",
        "to_do": {
            "rich_text": [{"type": "text", "text": {"content": text}}],
            "checked": checked,
        },
    }


def divider():
    return {"object": "block", "type": "divider", "divider": {}}


def callout(text, emoji="💡", color="blue_background"):
    return {
        "object": "block",
        "type": "callout",
        "callout": {
            "rich_text": [{"type": "text", "text": {"content": text}}],
            "icon": {"type": "emoji", "emoji": emoji},
            "color": color,
        },
    }


def quote(text):
    return {
        "object": "block",
        "type": "quote",
        "quote": {"rich_text": [{"type": "text", "text": {"content": text}}]},
    }


def code_block(text, language="plain text"):
    return {
        "object": "block",
        "type": "code",
        "code": {
            "rich_text": [{"type": "text", "text": {"content": text}}],
            "language": language,
        },
    }


def append_blocks(page_id, blocks):
    """Append blocks in batches of 100 (Notion API limit)."""
    for i in range(0, len(blocks), 100):
        batch = blocks[i : i + 100]
        notion.blocks.children.append(page_id, children=batch)
        print(f"  Appended blocks {i + 1}–{i + len(batch)}")


# ── Read existing Idea Bank ───────────────────────────────────────────────────


def read_idea_bank():
    print("Reading existing Idea Bank structure...")
    children = notion.blocks.children.list(IDEA_BANK_ID)
    print(f"  Found {len(children['results'])} top-level blocks")
    for b in children["results"]:
        btype = b["type"]
        if btype in ("heading_1", "heading_2", "heading_3", "paragraph"):
            rt = b[btype].get("rich_text", [])
            text = "".join(t.get("plain_text", "") for t in rt)
            if text:
                print(f"  [{btype}] {text[:80]}")
    return children["results"]


# ── Build all blocks ──────────────────────────────────────────────────────────


def all_blocks():
    return [
        # ── Hero
        callout(
            "Find your people. Find your events.\n"
            "Social app for live music, doofs, raves, arts events and nightlife — "
            "built around your real friends, not algorithms.",
            "🎪",
            "purple_background",
        ),
        divider(),
        # ── Quick Links
        h2("🔗 Quick Links"),
        p_link("🌐  Live Demo", "https://fivelidz.github.io/corral/"),
        p_link("💻  GitHub Repository", "https://github.com/fivelidz/corral"),
        p_link(
            "💡  Idea Bank",
            "https://www.notion.so/Idea-Bank-3407463480e980f99066f861ede25ba3",
        ),
        divider(),
        # ── Project Write-Up
        h2("📖 Project Write-Up"),
        h3("The Problem"),
        p(
            "Finding out about underground events is broken. You scroll Facebook pages from 2015, get buried in algorithm-driven Instagram content, or rely entirely on group chats. There's no single place that shows you what your actual friends are going to this weekend."
        ),
        p(
            "Mainstream options (Eventbrite, Facebook Events, RA) are built around the promoter. Corral is built around the person attending."
        ),
        h3("The Idea"),
        p(
            "Corral is a mobile-first social app where the feed shows what your friends are going to — not what's been promoted at you. You RSVP, your friends see it, and events surface through your network organically."
        ),
        quote("The best recommendation is a friend saying 'I'll be there'."),
        p(
            "The name 'Corral' is about gathering people together — herding your crew to the same place at the same time."
        ),
        h3("Who It's For"),
        bullet(
            "People who go to underground music events, doofs, raves, warehouse parties"
        ),
        bullet("Communities built around live music, arts events, dance"),
        bullet(
            "Promoters and artists who want a direct line to their audience without paying for reach"
        ),
        bullet("Anyone who's tired of missing events they would've loved"),
        h3("Core Mechanics"),
        numbered("Post an event — 30 seconds: title, date, location, optional image"),
        numbered("RSVP — tap Going or Interested. Your friends see it in their feed"),
        numbered(
            "Feed — events your friends are going to, filtered by scene / date / location"
        ),
        numbered("Discover — browse everything, not just your network"),
        numbered("Heat Map (planned) — see activity clustering on a map tonight"),
        h3("Design Philosophy"),
        bullet("Dark theme by default — built for night owls"),
        bullet("Mobile-first — phone app, not a desktop admin panel"),
        bullet(
            "Low friction — posting an event should be as easy as an Instagram story"
        ),
        bullet("No algorithm — chronological + social graph only"),
        bullet("Open scenes — filters for doof, rave, music, art, sport etc."),
        divider(),
        # ── Current State
        h2("🏗️ Current State  (v0.1 — April 2026)"),
        callout(
            "Migrated from Lovable prototype → full standalone Vite + React + TypeScript project. "
            "Builds clean. Auto-deployed to GitHub Pages on every push to main.",
            "✅",
            "green_background",
        ),
        h3("What's Built"),
        todo("React 19 + Vite + TypeScript scaffold", True),
        todo("Supabase auth (email/password sign in + sign up)", True),
        todo(
            "Event feed with search bar + filter chips (Tonight, This Week, Free, Music, Doof…)",
            True,
        ),
        todo("Event cards with Going / Interested RSVP", True),
        todo("Event detail page", True),
        todo(
            "Create event form (title, description, date/time, location, price, tags)",
            True,
        ),
        todo("Discover page — browse all events", True),
        todo("Profile page + sign out", True),
        todo("Dark theme, purple accent, bottom nav — mobile-first", True),
        todo("GitHub Actions auto-deploy → GitHub Pages", True),
        todo("Live demo at fivelidz.github.io/corral", True),
        h3("Immediate Next Steps"),
        todo("Set up real Supabase project and wire up .env"),
        todo("Seed DB with real local events for testing"),
        todo("Friends / follow system — feed is empty without this"),
        todo("Show which friends are Going on each event card"),
        todo("Profile editing — name, bio, avatar"),
        todo("Event image upload via Supabase Storage"),
        divider(),
        # ── Roadmap
        h2("🛣️ Roadmap"),
        h3("Phase 1 — Make It Work  (2 weeks)"),
        todo("Supabase project setup (DB schema, RLS policies, storage bucket)"),
        todo("Seed real events"),
        todo("Friends system"),
        todo("Friend activity on event cards"),
        todo("Image uploads"),
        h3("Phase 2 — Make It Good  (1–2 months)"),
        todo("Heat Map — social activity density on a live map"),
        todo("Scene pages — e.g. 'Melbourne Doof Scene' curated feed"),
        todo("Artist/promoter profiles — follow & get notified"),
        todo("Event comments + discussion thread"),
        todo("Shareable invite links"),
        todo("PWA — installable as mobile app"),
        todo("Push notifications / event reminders"),
        h3("Phase 3 — Make It Bigger  (3–6 months)"),
        todo("NFP or organisational structure to serve the scene"),
        todo("Low-fee ticketing (DIY, < 2% vs Eventbrite's 10%)"),
        todo("Multi-city / international"),
        todo("Recurring event series"),
        todo("API for promoters to push events in"),
        todo("Merchandise / merch store for artists"),
        divider(),
        # ── Tech stack
        h2("⚙️ Tech Stack"),
        code_block(
            "Frontend:  React 19 + TypeScript + Vite 8\n"
            "Styling:   Tailwind CSS v4  (dark theme, purple accent)\n"
            "Routing:   React Router v7\n"
            "Data:      TanStack Query v5\n"
            "Backend:   Supabase  (Postgres + Auth + Storage)\n"
            "Icons:     Lucide React\n"
            "Deploy:    GitHub Pages  (auto via Actions on push to main)\n"
            "Local:     ~/projects/corral_project",
            "plain text",
        ),
        divider(),
        # ── Ideas
        h2("💡 Feature Ideas Bank"),
        callout(
            "Drop new ideas here as they come. Bigger cross-cutting ideas live in the main Idea Bank.",
            "🧠",
            "yellow_background",
        ),
        h3("UI / UX"),
        bullet("Swipe left/right on event cards — Tinder-style RSVP"),
        bullet("Stories format — 'X friends are going out tonight'"),
        bullet("Event countdown widget on card"),
        bullet("'Who else is going?' modal with friend list"),
        bullet("Venue pages — history of all events at a location"),
        bullet("Calendar view — see your going/interested events in a month grid"),
        h3("Social / Community"),
        bullet("Crew groups — your regular squad, their RSVPs highlighted differently"),
        bullet("Event reviews + photo uploads after the fact"),
        bullet("'I was there' badge — post-event check-in"),
        bullet("Anonymous vibe check — rate the event without your name attached"),
        bullet(
            "Scene reputation — organisers who consistently run good events get a badge"
        ),
        bullet("Blocklist — hide events/people from your feed"),
        h3("Monetisation (non-extractive)"),
        bullet("Optional paid tier for promoters — analytics, priority placement"),
        bullet("Low-fee ticketing cut (target < 2%)"),
        bullet("Grants and funding if structured as NFP"),
        bullet("Merch store integration for artists"),
        divider(),
        # ── Dev notes
        h2("📝 Dev Notes"),
        p(
            "Originally prototyped in Lovable. Only Index.tsx was exported. The full component tree (Navbar, EventCard, SearchAndFilters), all hooks, contexts, pages and types were reverse-engineered from that single file and rebuilt as a clean standalone project."
        ),
        p(
            "The Supabase backend doesn't exist yet — the app will gracefully fail on data fetches until wired up. Required env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example)."
        ),
        p(
            "Repo is public so GitHub Pages works on the free plan. No secrets in git — .env is gitignored."
        ),
        p(
            "Notion integration token is in scripts/setup_notion.py — rotate this if the repo ever needs to become truly secret."
        ),
    ]


# ── Create the Hub page ───────────────────────────────────────────────────────


def create_corral_hub():
    print("\nCreating Corral Hub page...")
    blocks = all_blocks()
    print(f"  Total blocks to write: {len(blocks)}")

    # Create page with first batch (max 100)
    first_batch = blocks[:100]
    hub = notion.pages.create(
        parent={"type": "page_id", "page_id": IDEA_BANK_ID},
        icon={"type": "emoji", "emoji": "🎪"},
        cover={
            "type": "external",
            "external": {
                "url": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200"
            },
        },
        properties={
            "title": {
                "title": [
                    {"type": "text", "text": {"content": "Corral — Events Social App"}}
                ]
            }
        },
        children=first_batch,
    )
    print(f"  Page created, appended blocks 1–{len(first_batch)}")

    # Append remaining blocks in batches
    remaining = blocks[100:]
    if remaining:
        append_blocks(hub["id"], remaining)

    print(f"✅ Hub page: {hub['url']}")
    return hub


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    try:
        read_idea_bank()
        hub = create_corral_hub()
        print(f"\n🎉 Done!")
        print(f"   Notion Hub:  {hub['url']}")
        print(f"   Live demo:   https://fivelidz.github.io/corral/")
        print(f"   GitHub:      https://github.com/fivelidz/corral")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)
