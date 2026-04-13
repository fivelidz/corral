#!/usr/bin/env python3
"""
Polls Sadiya's Notion page for new text content and appends it to the Ideas Log.
Run manually or on a cron to capture her feedback.

Usage: python3 scripts/notion_poll_feedback.py
"""

import sys, os, json
from pathlib import Path
from datetime import datetime

sys.path.insert(0, "/home/fivelidz/.local/lib/python3.11/site-packages")
from notion_client import Client

TOKEN = os.environ.get("NOTION_TOKEN")
if not TOKEN:
    print("ERROR: set NOTION_TOKEN env var"); import sys; sys.exit(1)
SADIYA_ID = "3417463480e981108ed6d2b02ebb32d4"
HUB_ID = "3417463480e9816b9709ecbe766da873"

# State file — tracks which blocks we've already processed
STATE_FILE = Path(__file__).parent / ".feedback_state.json"

notion = Client(auth=TOKEN)


def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"seen_block_ids": []}


def save_state(state):
    STATE_FILE.write_text(json.dumps(state, indent=2))


def get_text_from_block(block):
    """Extract plain text from any text-bearing block."""
    btype = block.get("type")
    if btype not in (
        "paragraph",
        "heading_1",
        "heading_2",
        "heading_3",
        "bulleted_list_item",
        "numbered_list_item",
        "to_do",
        "quote",
        "callout",
    ):
        return None
    rich = block.get(btype, {}).get("rich_text", [])
    text = "".join(r.get("plain_text", "") for r in rich).strip()
    return text if text else None


def read_sadiya_page():
    """Read all blocks from Sadiya's page, return new ones."""
    state = load_state()
    seen = set(state["seen_block_ids"])
    results = []
    cursor = None

    while True:
        kwargs = {"block_id": SADIYA_ID, "page_size": 100}
        if cursor:
            kwargs["start_cursor"] = cursor
        resp = notion.blocks.children.list(**kwargs)
        for block in resp.get("results", []):
            bid = block["id"]
            text = get_text_from_block(block)
            btype = block.get("type", "")
            # Only capture user-written content (paragraphs and lists, not headings/dividers)
            if (
                text
                and bid not in seen
                and btype
                in ("paragraph", "bulleted_list_item", "numbered_list_item", "to_do")
            ):
                # Skip template placeholder text
                if text.startswith("← ") or text.startswith("→ "):
                    seen.add(bid)
                    continue
                results.append({"id": bid, "type": btype, "text": text})
        if not resp.get("has_more"):
            break
        cursor = resp["next_cursor"]

    return results, state, seen


def find_ideas_log_page():
    """Find the Ideas & Changes Log sub-page under the Hub."""
    children = notion.blocks.children.list(HUB_ID)
    for block in children.get("results", []):
        if block.get("type") == "child_page":
            title = block["child_page"].get("title", "")
            if "Ideas" in title and "Log" in title:
                return block["id"]
    return None


def append_feedback_to_log(new_blocks, ideas_log_id):
    """Append new feedback to the Ideas Log page."""
    date_str = datetime.now().strftime("%B %d %Y, %I:%M %p")
    blocks = [
        {"object": "block", "type": "divider", "divider": {}},
        {
            "object": "block",
            "type": "heading_3",
            "heading_3": {
                "rich_text": [
                    {
                        "type": "text",
                        "text": {"content": f"💬 New from Sadiya — {date_str}"},
                    }
                ]
            },
        },
    ]
    for item in new_blocks:
        blocks.append(
            {
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {
                    "rich_text": [{"type": "text", "text": {"content": item["text"]}}]
                },
            }
        )
    notion.blocks.children.append(ideas_log_id, children=blocks)
    print(f"  Appended {len(new_blocks)} new items to Ideas Log")


def main():
    print("🔍 Polling Sadiya's Notion page for new feedback...")
    new_items, state, seen = read_sadiya_page()

    if not new_items:
        print("  No new content found.")
        # Update seen list anyway
        resp = notion.blocks.children.list(SADIYA_ID)
        for block in resp.get("results", []):
            seen.add(block["id"])
        state["seen_block_ids"] = list(seen)
        save_state(state)
        return

    print(f"  Found {len(new_items)} new items:")
    for item in new_items:
        print(f"    - {item['text'][:80]}")

    ideas_log_id = find_ideas_log_page()
    if ideas_log_id:
        append_feedback_to_log(new_items, ideas_log_id)
    else:
        print("  ⚠️  Could not find Ideas Log page — printing only")
        for item in new_items:
            print(f"  FEEDBACK: {item['text']}")

    # Mark all as seen
    for item in new_items:
        seen.add(item["id"])
    # Also mark all current page blocks as seen
    resp = notion.blocks.children.list(SADIYA_ID)
    for block in resp.get("results", []):
        seen.add(block["id"])
    state["seen_block_ids"] = list(seen)
    save_state(state)
    print("  ✅ State saved.")


if __name__ == "__main__":
    main()
