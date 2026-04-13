#!/usr/bin/env python3
"""
Full Notion workspace update for Corral.
Rebuilds/updates all pages:
  - Corral Hub (master project page)
  - Ideas & Changes Log (running log of all ideas from Alexei + Sadiya)
  - Questions & Decisions (open questions, things to decide)
  - Sadiya collab page (feedback space + instructions)
  - Project Status (current build state, tech, links)

Run: python3 scripts/notion_full_update.py
Token read from NOTION_TOKEN env or hardcoded below (rotate if repo goes private).
"""

import sys, os, json

sys.path.insert(0, "/home/fivelidz/.local/lib/python3.11/site-packages")
from notion_client import Client

TOKEN = os.environ.get("NOTION_TOKEN")
if not TOKEN:
    print("ERROR: set NOTION_TOKEN env var"); import sys; sys.exit(1)
IDEA_BANK_ID = "3407463480e980f99066f861ede25ba3"
HUB_ID = "3417463480e9816b9709ecbe766da873"
SADIYA_ID = "3417463480e981108ed6d2b02ebb32d4"

notion = Client(auth=TOKEN)


# ── Block helpers ─────────────────────────────────────────────────────────────
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


def append(page_id, blocks):
    """Append in batches of 100."""
    for i in range(0, len(blocks), 100):
        notion.blocks.children.append(page_id, children=blocks[i : i + 100])
        print(f"  Appended {i + 1}–{i + len(blocks[i : i + 100])}")


def create_child_page(parent_id, title, emoji, blocks):
    first = blocks[:100]
    rest = blocks[100:]
    page = notion.pages.create(
        parent={"type": "page_id", "page_id": parent_id},
        icon={"type": "emoji", "emoji": emoji},
        properties={"title": {"title": [{"type": "text", "text": {"content": title}}]}},
        children=first,
    )
    print(f"  Created: {title}")
    if rest:
        append(page["id"], rest)
    return page


def clear_and_rewrite(page_id, blocks):
    """Delete all existing blocks from a page then rewrite."""
    existing = notion.blocks.children.list(page_id)
    for b in existing.get("results", []):
        try:
            notion.blocks.delete(b["id"])
        except Exception:
            pass
    append(page_id, blocks)


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 1 — IDEAS & CHANGES LOG
# Running log of every idea and suggested change from anyone
# ═══════════════════════════════════════════════════════════════════════════════
def ideas_log_blocks():
    return [
        callout(
            "Running log of all ideas and suggested changes — from Alexei, Sadiya, or Claude. "
            "Newest at the top. Everything is recorded here before being acted on.",
            "📋",
            "gray_background",
        ),
        div(),
        h2("🗓️ April 13 2026"),
        h3("💡 From Alexei"),
        pb("Light / Dark mode toggle"),
        p(
            "Suggested adding a theme switcher so users can choose between dark (default) and light mode. "
            "Preference saved to localStorage."
        ),
        p("→ Status: ✅ Built and deployed."),
        pb("Notion as the collaboration layer"),
        p(
            "Instead of building a separate WhatsApp bridge for Corral, use Notion as the shared workspace. "
            "Sadiya gets a Notion page, writes feedback there, Claude reads and acts on it. "
            "WhatsApp used only to send the link once."
        ),
        p("→ Status: ✅ Implemented. Polling script reads her page."),
        pb("Separate the corral bridge from doof.ing"),
        p(
            "Don't touch the existing WhatsApp bridge on minirig — it's for doof.ing/Qalarc. "
            "Corral uses Notion as its coordination layer instead."
        ),
        p("→ Status: ✅ Agreed and implemented."),
        pb("Full rewrite — remove Lovable/Vite boilerplate"),
        p(
            "App was still carrying Vite starter template CSS (App.css with .hero, .ticks, #center), "
            "Vite SVG assets, and Lovable-style inline CSS variables on every element. "
            "Requested a clean rewrite with proper Tailwind v4 @theme tokens."
        ),
        p(
            "→ Status: ✅ Done. All boilerplate removed. Proper Tailwind classes throughout."
        ),
        pb("In-app Agent chat page"),
        p(
            "Add a chat interface in the app where users can ask questions about events. "
            "Hooks into a VITE_AGENT_URL endpoint. In demo mode has scripted responses."
        ),
        p("→ Status: ✅ Built. Real agent endpoint to be wired up later."),
        pb("Agent for building Corral (meta-agent)"),
        p(
            "The 'agent' concept has two layers: (1) Claude in this conversation helping build the app "
            "— that's already happening. (2) An in-app agent for end users to query events — also built. "
            "These are separate things."
        ),
        p("→ Status: ✅ Clarified. Both built."),
        div(),
        h3("💡 From Sadiya"),
        p("← Waiting for first feedback. Space reserved."),
        div(),
        h2("📐 Design Decisions Made"),
        li(
            "Dark mode as default, light mode as option — not system-preference-based, user choice"
        ),
        li(
            "Demo mode: app works fully without Supabase connected — shows 5 real-looking events"
        ),
        li("No algorithm — feed is chronological + social graph only"),
        li("Mobile-first, bottom nav, max-width 2xl centred"),
        li("Purple accent oklch(65% 0.18 300) — works in both light and dark"),
        li("Notion as collab layer, not a bespoke backend"),
        li("Corral bridge completely separate from doof.ing infrastructure"),
        div(),
        h2("🔮 Ideas Parked for Later"),
        li("Heat Map — real-time activity density on a map (Alexei)"),
        li("Rethinking the Desktop — separate idea bank item (Alexei)"),
        li("NFP/religion for live music scenes — legal exploration needed (Alexei)"),
        li("Scene pages — e.g. Melbourne Doof Scene curated feed"),
        li("Artist/promoter profiles with follow + notify"),
        li("Swipe RSVP — Tinder-style event cards"),
        li("Post-event photo drops + 'I was there' badge"),
        li("Anonymous vibe check after events"),
        li("Low-fee ticketing integration (< 2%)"),
    ]


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 2 — QUESTIONS & DECISIONS
# Open questions that need answers from Alexei or Sadiya
# ═══════════════════════════════════════════════════════════════════════════════
def questions_blocks():
    return [
        callout(
            "Open questions for Alexei and Sadiya. Answer these to unblock the next phase of development. "
            "Claude reads this page — write answers directly here.",
            "❓",
            "yellow_background",
        ),
        div(),
        h2("🔴 Needs Answer — Blocking"),
        pb("Q1: Which phone number logs into the Corral WhatsApp bridge?"),
        p(
            "The doof.ing bridge uses +61493484788 (Qalarc). Corral needs a different account. "
            "Options: your personal number, a dedicated Corral number, or skip WA and use Notion-only."
        ),
        p("→ Alexei's answer: "),
        pb("Q2: What is the Supabase project URL and anon key for Corral?"),
        p(
            "The app is in demo mode until these are provided. Create a project at supabase.com, "
            "run the schema from the README, and drop the keys in .env"
        ),
        p("→ Alexei's answer: "),
        div(),
        h2("🟡 Nice to Decide Soon"),
        pb("Q3: What should the app be called publicly?"),
        p("'corral' is the working name. Is this the final name? Any alternatives?"),
        p("→ Alexei: "),
        p("→ Sadiya: "),
        pb("Q4: Who is the initial target audience / launch city?"),
        p("Melbourne underground scene? Specific scene (doof, rave, queer)? National?"),
        p("→ Alexei: "),
        p("→ Sadiya: "),
        pb("Q5: Should posting events be open to anyone, or invite-only at launch?"),
        p(
            "Open posting = fast growth but noise. Invite-only = quality control but slower."
        ),
        p("→ Alexei: "),
        p("→ Sadiya: "),
        pb("Q6: Should there be a web version or mobile-app-only?"),
        p(
            "Current build works in a mobile browser. Could be wrapped as a PWA (installable). "
            "Or build native with React Native later. Web-first for now?"
        ),
        p("→ Alexei: "),
        div(),
        h2("🟢 Longer Term — No Rush"),
        pb("Q7: NFP / organisational structure"),
        p(
            "Worth exploring registering a not-for-profit to underpin the scene mission. "
            "Alexei mentioned this as an idea. Worth a proper legal exploration?"
        ),
        pb("Q8: Ticketing integration"),
        p(
            "Low-fee ticketing is a clear differentiator. Which provider to integrate? "
            "Or build a minimal custom solution?"
        ),
        pb("Q9: Heat map — data source?"),
        p(
            "The heat map idea needs real location data. Source from RSVPs + check-ins? "
            "Or partner with venues for real-time data?"
        ),
    ]


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 3 — PROJECT STATUS
# Current technical state, links, how to run
# ═══════════════════════════════════════════════════════════════════════════════
def status_blocks():
    return [
        callout(
            "Live as of April 13 2026. Full demo mode — no backend required. "
            "Auto-deploys on every git push to main.",
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
        todo("Tailwind v4 with @theme tokens — bg-background, text-primary etc.", True),
        todo(
            "Light/dark mode toggle (Sun/Moon icon in top nav, persisted to localStorage)",
            True,
        ),
        todo(
            "Demo mode — 5 events, mock RSVPs, mock friends — works with no backend",
            True,
        ),
        todo(
            "Event feed with search + filter chips (Tonight, This Week, Free, Music, Doof…)",
            True,
        ),
        todo("Event cards with Going/Interested RSVP toggle", True),
        todo("Event detail page", True),
        todo("Create event form", True),
        todo("Discover page", True),
        todo("Profile + sign out", True),
        todo("Agent chat page with demo responses + quick prompts", True),
        todo("GitHub Actions auto-deploy to GitHub Pages on push to main", True),
        todo("Notion workspace: Hub, Ideas Log, Questions, Sadiya page", True),
        todo("All Vite/Lovable boilerplate removed", True),
        div(),
        h2("🚧 Not Yet Built"),
        todo("Supabase backend — events, auth, RSVPs, storage"),
        todo("Friends/follow system"),
        todo("Real agent endpoint (VITE_AGENT_URL)"),
        todo("Push notifications"),
        todo("Image upload"),
        todo("Heat map"),
        todo("Scene pages"),
        div(),
        h2("⚙️ Tech Stack"),
        code(
            "Frontend:  React 19 + TypeScript + Vite 8\n"
            "Styling:   Tailwind CSS v4  (@theme tokens, light+dark)\n"
            "Routing:   React Router v7\n"
            "Data:      TanStack Query v5\n"
            "Backend:   Supabase (not yet wired — app in demo mode)\n"
            "Icons:     Lucide React\n"
            "Deploy:    GitHub Pages via Actions (auto on push)\n"
            "Collab:    Notion API (this workspace)\n"
            "Local dev: ~/projects/corral_project  (superlocal)",
        ),
        div(),
        h2("🏃 How to Run Locally"),
        code(
            "cd ~/projects/corral_project\n"
            "bun dev              # dev server at localhost:5173/corral/\n"
            "bun run build        # production build\n"
            "bun run preview      # preview production build locally\n\n"
            "# Deploy manually (auto-deploys on push too):\n"
            "git push             # triggers GitHub Actions",
            "bash",
        ),
        div(),
        h2("📁 Project Structure"),
        code(
            "src/\n"
            "  components/   EventCard, Navbar (theme toggle), SearchAndFilters, DemoBanner\n"
            "  contexts/     AuthContext (Supabase + demo), ThemeContext (light/dark)\n"
            "  hooks/        useEvents, useRsvps (Supabase + demo fallback)\n"
            "  lib/          supabase.ts, utils.ts, demo-data.ts\n"
            "  pages/        Index, Login, Discover, CreateEvent, EventDetail, Profile,\n"
            "                Notifications, Agent\n"
            "  types/        index.ts\n\n"
            "scripts/\n"
            "  notion_full_update.py   — this script\n"
            "  notion_poll_feedback.py — reads Sadiya's page for new feedback\n"
            "  setup_notion.py         — initial hub page setup\n\n"
            "docs/\n"
            "  lovable-original-index.txt  — original Lovable export (archived)\n"
            "  archive/                    — Vite boilerplate archived before deletion",
        ),
    ]


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 4 — SADIYA COLLAB PAGE (rewrite)
# ═══════════════════════════════════════════════════════════════════════════════
def sadiya_blocks():
    return [
        callout(
            "Hey Sadiya! 👋\n\n"
            "This is your space for the Corral app project. "
            "Alexei is building it and wants your thoughts — as an early tester and someone who goes to events.\n\n"
            "You can write directly in this page. Claude (the AI helping build it) reads this and acts on what you write.",
            "👋",
            "purple_background",
        ),
        div(),
        h2("🌐 Try the App"),
        pl("→ Open Corral (live demo)", "https://fivelidz.github.io/corral/"),
        p(
            "No login needed — it's in demo mode with simulated events and friends. "
            "Works best on your phone. Try the feed, the event details, the filters."
        ),
        p("Latest update: light/dark mode toggle added (sun/moon icon top right)."),
        div(),
        h2("📝 Your Feedback"),
        p(
            "Write anything below. First impressions, things you like, things that feel off, "
            "features you'd want, stuff that's confusing. There are no wrong answers."
        ),
        h3("First impressions of the app"),
        p("← Write here after trying it"),
        h3("Things you'd want that aren't there"),
        p("← What would make you actually use this?"),
        h3("Events you wish you'd found this way"),
        p("← Think of a time you missed something or found out too late"),
        h3("Name thoughts — is 'corral' good?"),
        p("← Does the name make sense to you?"),
        div(),
        h2("❓ Questions for You"),
        p("These are open questions Alexei wants your take on:"),
        num(
            "What kinds of events do you go to most? (music, arts, doofs, sport, other?)"
        ),
        num(
            "How do you usually find out about events right now? (Instagram, word of mouth, groups?)"
        ),
        num("Would you post events yourself, or mainly just find them?"),
        num("Dark or light mode — which do you prefer?"),
        num("Would you share the app with friends? What would you say about it?"),
        div(),
        h2("🔗 All Links"),
        pl("Live app", "https://fivelidz.github.io/corral/"),
        pl("GitHub (code)", "https://github.com/fivelidz/corral"),
        pl(
            "Full project notes",
            "https://www.notion.so/Corral-Events-Social-App-3417463480e9816b9709ecbe766da873",
        ),
        div(),
        h2("📬 How This Works"),
        p(
            "You write here → Claude reads it → builds or answers → writes back here with what changed."
        ),
        p("You don't need to use any special format. Just write naturally."),
        p("Alexei can also see everything here and will jump in with context."),
    ]


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("\n🎪 Corral Notion Full Update\n")

    # 1. Create Ideas & Changes Log page under Hub
    print("1. Creating Ideas & Changes Log...")
    ideas_page = create_child_page(
        HUB_ID, "📋 Ideas & Changes Log", "📋", ideas_log_blocks()
    )
    print(f"   → {ideas_page['url']}")

    # 2. Create Questions & Decisions page under Hub
    print("2. Creating Questions & Decisions...")
    q_page = create_child_page(
        HUB_ID, "❓ Questions & Decisions", "❓", questions_blocks()
    )
    print(f"   → {q_page['url']}")

    # 3. Create Project Status page under Hub
    print("3. Creating Project Status...")
    status_page = create_child_page(HUB_ID, "🟢 Project Status", "🟢", status_blocks())
    print(f"   → {status_page['url']}")

    # 4. Rewrite Sadiya's page
    print("4. Rewriting Sadiya's page...")
    clear_and_rewrite(SADIYA_ID, sadiya_blocks())
    print(
        f"   → https://www.notion.so/Sadiya-Corral-Collab-Space-{SADIYA_ID.replace('-', '')}"
    )

    # 5. Add index links to Hub
    print("5. Adding sub-page links to Hub...")
    notion.blocks.children.append(
        HUB_ID,
        children=[
            div(),
            h2("📂 Sub-pages"),
            pl("📋  Ideas & Changes Log", ideas_page["url"]),
            pl("❓  Questions & Decisions", q_page["url"]),
            pl("🟢  Project Status", status_page["url"]),
            pl(
                "👋  Sadiya's Collab Space",
                f"https://www.notion.so/Sadiya-Corral-Collab-Space-{SADIYA_ID.replace('-', '')}",
            ),
        ],
    )

    print("\n✅ All done!")
    print(
        f"   Hub:     https://www.notion.so/Corral-Events-Social-App-{HUB_ID.replace('-', '')}"
    )
    print(
        f"   Sadiya:  https://www.notion.so/Sadiya-Corral-Collab-Space-{SADIYA_ID.replace('-', '')}"
    )
    print(f"   Ideas:   {ideas_page['url']}")
    print(f"   Questions: {q_page['url']}")
    print(f"   Status:  {status_page['url']}")
