#!/usr/bin/env python3
"""
Creates the Sadiya collaboration page inside the Corral Notion hub.
Also sends a message to notify her about the page.

Usage: NOTION_TOKEN=ntn_xxx python3 scripts/notion_sadiya_page.py
"""

import sys

sys.path.insert(0, "/home/fivelidz/.local/lib/python3.11/site-packages")

import os
from notion_client import Client

TOKEN = os.environ.get("NOTION_TOKEN")
if not TOKEN:
    print("ERROR: Set NOTION_TOKEN")
    sys.exit(1)

# The Corral Hub page created by setup_notion.py
CORRAL_HUB_ID = "3417463480e9816b9709ecbe766da873"

notion = Client(auth=TOKEN)


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


def bullet(text):
    return {
        "object": "block",
        "type": "bulleted_list_item",
        "bulleted_list_item": {
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


def create_sadiya_page():
    print("Creating Sadiya collaboration page inside Corral Hub...")

    page = notion.pages.create(
        parent={"type": "page_id", "page_id": CORRAL_HUB_ID},
        icon={"type": "emoji", "emoji": "👋"},
        properties={
            "title": {
                "title": [
                    {
                        "type": "text",
                        "text": {"content": "Sadiya — Corral Collab Space"},
                    }
                ]
            }
        },
        children=[
            callout(
                "Hey Sadiya! This is your space to interact with the Corral project and the AI agent Alexei has running. "
                "You can use the live app, leave ideas, questions and feedback here, and the agent will be able to see and respond.",
                "👋",
                "purple_background",
            ),
            divider(),
            h2("🌐 Try the App"),
            p_link("→ Open Corral (live demo)", "https://fivelidz.github.io/corral/"),
            p(
                "The app is running in demo mode — no login needed, events and friends are simulated so you can explore the full UI. "
                "Tap around, check out the event feed, try the Agent tab at the bottom."
            ),
            divider(),
            h2("🤖 The Agent Tab"),
            p(
                "Inside the app there's an 'Agent' tab in the bottom navigation (the robot icon). "
                "This is a chat interface that will connect to an AI agent Alexei runs locally — "
                "it can answer questions about events, tell you what's on, who's going, and eventually "
                "take actions like RSVPing or posting events on your behalf."
            ),
            p(
                "For now it runs in demo mode with pre-set responses, but the real agent hook is ready to wire up."
            ),
            callout(
                "The agent is designed to be conversational and scene-aware. "
                "Think: 'What's on this weekend in Fitzroy?' or 'Who from my friends is going to the doof?' — "
                "natural questions you'd ask a person who knows your scene.",
                "🧠",
                "yellow_background",
            ),
            divider(),
            h2("💬 Your Feedback & Ideas"),
            p(
                "Drop anything here — thoughts on the app, features you'd want, things that feel off, "
                "questions for the agent, ideas for events you'd want to see. Alexei's Claude agent reads this page."
            ),
            h3("First impressions"),
            p("← Write your thoughts here after trying the app"),
            h3("Feature wishes"),
            p("← What would make you actually use this?"),
            h3("Questions for the agent"),
            p("← What would you want to ask it?"),
            divider(),
            h2("🛠️ How the Agent Works (for the curious)"),
            bullet("Alexei runs Claude Code (Anthropic's AI) locally on his machine"),
            bullet(
                "The Corral agent page in the app sends messages to an HTTP endpoint on his server"
            ),
            bullet(
                "The agent has context about Corral — events, users, what's happening — and can answer or act"
            ),
            bullet(
                "It's not a generic chatbot — it's specifically wired into this app and this scene"
            ),
            bullet(
                "Future: it could proactively message you ('Hey, 3 of your friends just RSVPed to something this Friday')"
            ),
            divider(),
            h2("📋 Collab Checklist"),
            todo("Sadiya tries the live demo"),
            todo("Sadiya tries the Agent chat tab"),
            todo("Sadiya leaves first impressions above"),
            todo("Alexei wires up real agent endpoint"),
            todo("Sadiya gets early access to real version"),
            todo("Sadiya added as a test user when Supabase is live"),
            divider(),
            h2("🔗 Quick Links"),
            p_link("Live demo", "https://fivelidz.github.io/corral/"),
            p_link("GitHub repo", "https://github.com/fivelidz/corral"),
            p_link(
                "Corral Hub (full project notes)",
                "https://www.notion.so/Corral-Events-Social-App-3417463480e9816b9709ecbe766da873",
            ),
        ],
    )

    print(f"✅ Sadiya page created: {page['url']}")
    return page


if __name__ == "__main__":
    try:
        page = create_sadiya_page()
        print(f"\n🎉 Done!")
        print(f"   Share this with Sadiya: {page['url']}")
        print(f"   Or share the live app:  https://fivelidz.github.io/corral/")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)
