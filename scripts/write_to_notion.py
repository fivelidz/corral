#!/usr/bin/env python3
"""
Write Corral project docs and idea bank to Notion.
Usage: NOTION_TOKEN=secret_xxx python3 scripts/write_to_notion.py

The target page is: https://www.notion.so/Idea-Bank-3407463480e980f99066f861ede25ba3
Page ID: 3407463480e980f99066f861ede25ba3

To get a token:
1. Go to https://www.notion.so/my-integrations
2. Create a new integration (name it "Corral Dev")
3. Copy the secret token
4. Share the Idea Bank page with that integration (... > Connect to > Corral Dev)
5. Run: NOTION_TOKEN=secret_xxx python3 scripts/write_to_notion.py
"""

import os
import sys
from notion_client import Client

NOTION_TOKEN = os.environ.get("NOTION_TOKEN")
IDEA_BANK_PAGE_ID = "3407463480e980f99066f861ede25ba3"

if not NOTION_TOKEN:
    print("ERROR: Set NOTION_TOKEN environment variable")
    print("  export NOTION_TOKEN=secret_xxx")
    sys.exit(1)

notion = Client(auth=NOTION_TOKEN)


def h1(text: str) -> dict:
    return {
        "object": "block",
        "type": "heading_1",
        "heading_1": {"rich_text": [{"type": "text", "text": {"content": text}}]},
    }


def h2(text: str) -> dict:
    return {
        "object": "block",
        "type": "heading_2",
        "heading_2": {"rich_text": [{"type": "text", "text": {"content": text}}]},
    }


def h3(text: str) -> dict:
    return {
        "object": "block",
        "type": "heading_3",
        "heading_3": {"rich_text": [{"type": "text", "text": {"content": text}}]},
    }


def p(text: str) -> dict:
    return {
        "object": "block",
        "type": "paragraph",
        "paragraph": {"rich_text": [{"type": "text", "text": {"content": text}}]},
    }


def p_bold(text: str) -> dict:
    return {
        "object": "block",
        "type": "paragraph",
        "paragraph": {
            "rich_text": [
                {
                    "type": "text",
                    "text": {"content": text},
                    "annotations": {"bold": True},
                }
            ]
        },
    }


def bullet(text: str) -> dict:
    return {
        "object": "block",
        "type": "bulleted_list_item",
        "bulleted_list_item": {
            "rich_text": [{"type": "text", "text": {"content": text}}]
        },
    }


def todo(text: str, checked: bool = False) -> dict:
    return {
        "object": "block",
        "type": "to_do",
        "to_do": {
            "rich_text": [{"type": "text", "text": {"content": text}}],
            "checked": checked,
        },
    }


def divider() -> dict:
    return {"object": "block", "type": "divider", "divider": {}}


def callout(text: str, emoji: str = "💡") -> dict:
    return {
        "object": "block",
        "type": "callout",
        "callout": {
            "rich_text": [{"type": "text", "text": {"content": text}}],
            "icon": {"type": "emoji", "emoji": emoji},
        },
    }


# ── Create a child page for Corral inside the Idea Bank ─────────────────────


def create_corral_page():
    print("Creating Corral project page in Idea Bank...")

    page = notion.pages.create(
        parent={"type": "page_id", "page_id": IDEA_BANK_PAGE_ID},
        properties={
            "title": {
                "title": [
                    {
                        "type": "text",
                        "text": {"content": "🎪 Corral — Events Social App"},
                    }
                ]
            }
        },
        children=[
            callout(
                "Social app for discovering events through your friends. Find your people. Find your events.",
                "🎪",
            ),
            divider(),
            h2("🧭 Vision"),
            p(
                "Corral is a social events app built for live music, doofs, raves, arts events and nightlife. The core idea: the best way to find out about something is through people you trust."
            ),
            p(
                "The feed shows what your friends are going to — not a generic list. You RSVP, your friends see it, and events surface organically through your network. No algorithm, no paid promotion, just your scene."
            ),
            divider(),
            h2("✅ What's Built (v0.1)"),
            todo("React + Vite + TypeScript project (migrated from Lovable)", True),
            todo("Auth (Supabase email/password)", True),
            todo(
                "Event feed with search and filter chips (Tonight, This Week, Free, Music, Doof...)",
                True,
            ),
            todo("Event cards with RSVP (Going / Interested)", True),
            todo("Event detail page", True),
            todo(
                "Create event form (title, description, date/time, location, price, tags)",
                True,
            ),
            todo("Discover page", True),
            todo("Profile page with sign out", True),
            todo("Dark theme with purple accent", True),
            todo("Bottom navigation (mobile-first)", True),
            divider(),
            h2("🛣️ Roadmap"),
            h3("Near term"),
            todo("Connect to real Supabase instance + test end-to-end"),
            todo("Friends system — follow/friend users"),
            todo("Show which friends are going to each event"),
            todo("Event image upload (Supabase Storage)"),
            todo("Push notifications / reminders"),
            h3("Medium term"),
            todo("Heat Map — dynamic colour-coded map of social activity in an area"),
            todo("Follow artists and promoters — get notified when they post"),
            todo("Event comments / discussion thread"),
            todo("Invite links — share a Corral event externally"),
            todo("Scene pages — e.g. 'Melbourne Doof Scene' as a curated feed"),
            h3("Long term / Big ideas"),
            todo(
                "NFP / scene organisation — register as not-for-profit to serve live music/rave/doof communities"
            ),
            todo("Ticketing integration"),
            todo("Artist profiles and touring schedules"),
            divider(),
            h2("🏗️ Tech Stack"),
            bullet("Frontend: React 19 + TypeScript + Vite"),
            bullet(
                "Styling: Tailwind CSS v4 + CSS custom properties (dark theme, purple accent)"
            ),
            bullet("Routing: React Router v7"),
            bullet("Data: TanStack Query v5"),
            bullet("Backend: Supabase (auth + postgres + storage)"),
            bullet("Icons: Lucide React"),
            bullet("Code: /home/fivelidz/projects/corral_project"),
            divider(),
            h2("📐 DB Schema (Supabase)"),
            p(
                "Tables: events, rsvps, friend_relations (planned). Full schema in README.md."
            ),
            bullet(
                "events — id, title, description, date, time, location, venue, image_url, price, tags[], lat, lng, created_by"
            ),
            bullet(
                "rsvps — event_id, user_id, status (going | interested | not_going)"
            ),
            bullet(
                "friend_relations — user_id, friend_id, status (pending | accepted)"
            ),
            divider(),
            h2("💭 Notes & Decisions"),
            p(
                "The app was originally prototyped in Lovable. The component structure was inferred from a single exported Index.tsx file, then rebuilt as a full standalone Vite project. The design intentionally targets the doof/rave/underground event scene — not mainstream concerts or corporate events."
            ),
            p(
                "The 'friends are going' social proof mechanic is the core differentiator. This should be prominent everywhere in the UI."
            ),
        ],
    )
    print(f"✅ Corral page created: {page['url']}")
    return page


# ── Update the Idea Bank page with the 3 brainstorm ideas ───────────────────


def add_idea_bank_entries():
    print("Adding idea bank entries to parent page...")

    notion.blocks.children.append(
        IDEA_BANK_PAGE_ID,
        children=[
            divider(),
            h2("💡 Idea Drops — April 2026"),
            h3("🗺️ Heat Map — Social Activity Visualiser"),
            p(
                "A dynamic, colour-coded map showing social activity density in a geographic area. Most useful for nightlife — you can see at a glance where people are going out tonight, which streets are busy, which venues are hot."
            ),
            bullet(
                "Could be a feature inside Corral (where are people going tonight?)"
            ),
            bullet("Could also be a standalone tool for city explorers / night owls"),
            bullet(
                "Real-time data from RSVPs, check-ins, or even anonymised foot traffic"
            ),
            bullet("Privacy consideration: opt-in only, aggregate not individual"),
            p_bold("Status: Idea / roadmap item for Corral"),
            divider(),
            h3("🖥️ Rethinking the Desktop"),
            p(
                "How will people work with computers in the future? Will keyboards and mice still be around? What about rectangular screens? What will actually sit on a work desk?"
            ),
            bullet(
                "Keyboards: likely persist for high-throughput text but voice/gesture will supplement"
            ),
            bullet("Screens: flexible/foldable forms, ambient displays, AR overlays"),
            bullet(
                "The desk itself: could become a surface computer, or disappear entirely"
            ),
            bullet(
                "Spatial computing (Vision Pro, AR glasses) suggests the 'desktop' becomes a room"
            ),
            bullet("Work vs rest separation: will we stop needing a dedicated desk?"),
            p_bold("Status: Speculative / philosophy of technology exploration"),
            divider(),
            h3("🎵 NFP or Religion for Live Music / Doof / Rave Scenes"),
            p(
                "Register as a not-for-profit organisation or a religion with the sole purpose of revitalising and revolutionising live music, dance, rave and doof scenes — and minimising tax obligations."
            ),
            bullet(
                "NFP structure: able to receive donations, apply for grants, reinvest revenue into the scene"
            ),
            bullet(
                "Religion angle: provocative — but legally interesting. Music as spiritual practice. Rave as congregation."
            ),
            bullet(
                "Could underpin Corral legally — the app as a tool of the organisation"
            ),
            bullet(
                "Practical: run events, fund artists, provide infrastructure for the underground scene"
            ),
            bullet(
                "Needs legal advice — AUS NFP registration (ACNC), ABN, DGR status exploration"
            ),
            p_bold("Status: Early concept — worth researching legal pathways"),
        ],
    )
    print("✅ Idea Bank entries added")


if __name__ == "__main__":
    try:
        create_corral_page()
        add_idea_bank_entries()
        print("\n🎉 Done! Check your Notion Idea Bank page.")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nMake sure:")
        print("  1. Your NOTION_TOKEN is correct")
        print("  2. You've shared the Idea Bank page with your integration")
        print("     (Open page in Notion → ··· menu → Connect to → your integration)")
        sys.exit(1)
