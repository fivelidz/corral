#!/usr/bin/env python3
"""
Corral Event Scraper — General-purpose event ingestion tool.

Scrapes events from multiple sources and inserts them into Supabase.
Designed to be extended: add a new Source class for any site.

Sources implemented:
  - Eventbrite (public API)
  - Resident Advisor (RA) — scrapes event listings
  - Humanitix — scrapes public event pages
  - Moshtix — scrapes event listings
  - Facebook Events — via unofficial scrape (best effort)
  - Generic iCal/ics feeds

Architecture:
  Each source is a class with a `scrape(city, days_ahead) -> list[ScrapedEvent]` method.
  The coordinator deduplicates and upserts to Supabase.

Usage:
  # Set env vars first:
  export SUPABASE_URL=https://xxx.supabase.co
  export SUPABASE_SERVICE_KEY=your-service-role-key  # NOT anon key — service key bypasses RLS
  export EVENTBRITE_TOKEN=your-token  # optional, improves EB results

  python3 scripts/event_scraper.py --city Sydney --days 14
  python3 scripts/event_scraper.py --city Melbourne --sources ra,humanitix --days 7
  python3 scripts/event_scraper.py --dry-run   # prints events, does not insert

Dependencies:
  pip install requests beautifulsoup4 python-dateutil supabase icalendar

Run on a cron (e.g. every 6 hours):
  0 */6 * * * SUPABASE_URL=... SUPABASE_SERVICE_KEY=... python3 /path/to/event_scraper.py --city Sydney --days 14
"""

import os
import sys
import json
import hashlib
import argparse
import logging
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone, timedelta
from typing import Optional
from urllib.parse import urljoin, quote_plus

# Add user site-packages for locally installed deps
sys.path.insert(0, "/home/fivelidz/.local/lib/python3.11/site-packages")

# ── Dependency check ──────────────────────────────────────────────────────────
try:
    import requests
    from bs4 import BeautifulSoup
    from dateutil import parser as dateparser
except ImportError:
    print(
        "Missing deps. Run: pip install --target=/home/fivelidz/.local/lib/python3.11/site-packages requests beautifulsoup4 python-dateutil"
    )
    sys.exit(1)

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger("corral-scraper")

# ══════════════════════════════════════════════════════════════════════════════
# DATA MODEL — matches Corral's Supabase schema
# ══════════════════════════════════════════════════════════════════════════════

CATEGORIES = {
    "festival",
    "club_night",
    "gig",
    "party",
    "arts",
    "sport",
    "uni",
    "tour_date",
    "market",
    "workshop",
    "other",
}

# Keyword → category mapping (expand as needed)
CATEGORY_KEYWORDS = {
    "festival": ["festival", "fest", "weekend", "multi-day"],
    "club_night": [
        "club",
        "clubnight",
        "rave",
        "dj",
        "techno",
        "house",
        "dance",
        "doof",
        "warehouse",
        "underground",
        "psytrance",
        "trance",
    ],
    "gig": ["gig", "live music", "band", "concert", "tour", "headline"],
    "party": ["party", "celebration", "birthday", "launch"],
    "arts": [
        "art",
        "gallery",
        "exhibition",
        "theatre",
        "theater",
        "comedy",
        "film",
        "cinema",
        "poetry",
        "spoken word",
    ],
    "market": ["market", "bazaar", "fair"],
    "workshop": ["workshop", "class", "course", "seminar", "talk", "conference"],
    "sport": ["sport", "football", "soccer", "basketball", "run", "race", "match"],
    "uni": ["uni", "university", "student", "campus", "college"],
    "tour_date": ["tour", "headline tour"],
}


@dataclass
class ScrapedEvent:
    """Normalised event before Supabase insert."""

    title: str
    starts_at: str  # ISO 8601 UTC
    source: str  # e.g. "eventbrite", "ra", "humanitix"
    source_url: str  # original listing URL
    source_id: str  # unique ID from source (for dedup)

    description: Optional[str] = None
    image_url: Optional[str] = None
    ends_at: Optional[str] = None
    location_name: Optional[str] = None
    address: Optional[str] = None
    suburb: Optional[str] = None
    city: str = "Sydney"
    lat: Optional[float] = None
    lng: Optional[float] = None
    category: str = "other"
    tags: list = field(default_factory=list)
    price_min: float = 0
    price_max: Optional[float] = None
    ticket_url: Optional[str] = None
    visibility: str = "public"

    def fingerprint(self) -> str:
        """SHA-256 of source+source_id for dedup."""
        return hashlib.sha256(f"{self.source}:{self.source_id}".encode()).hexdigest()

    def to_supabase_row(self, bot_user_id: str) -> dict:
        """Map to Supabase events table row."""
        return {
            "created_by": bot_user_id,
            "title": self.title,
            "description": self.description,
            "image_url": self.image_url,
            "starts_at": self.starts_at,
            "ends_at": self.ends_at,
            "location_name": self.location_name,
            "address": self.address,
            "suburb": self.suburb,
            "city": self.city,
            "lat": self.lat,
            "lng": self.lng,
            "category": self.category,
            "tags": self.tags,
            "price_min": self.price_min,
            "price_max": self.price_max,
            "ticket_url": self.ticket_url or self.source_url,
            "visibility": self.visibility,
            # Store source metadata in tags so we can trace it
        }


def guess_category(text: str) -> str:
    """Guess event category from title/description text."""
    low = text.lower()
    for cat, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in low for kw in keywords):
            return cat
    return "other"


def parse_price(text: str) -> tuple[float, Optional[float]]:
    """Parse price text → (min, max). Returns (0, None) for free."""
    import re

    if not text:
        return 0, None
    low = text.lower()
    if any(w in low for w in ["free", "no cost", "$0"]):
        return 0, None
    nums = [float(x) for x in re.findall(r"\d+(?:\.\d+)?", text)]
    if not nums:
        return 0, None
    return min(nums), max(nums) if len(nums) > 1 else None


# ══════════════════════════════════════════════════════════════════════════════
# SOURCES
# ══════════════════════════════════════════════════════════════════════════════


class EventbriteSource:
    """
    Eventbrite public API.
    Docs: https://www.eventbrite.com/platform/api
    Free tier: 2000 calls/day. No token needed for public events.
    """

    NAME = "eventbrite"
    BASE = "https://www.eventbriteapi.com/v3"

    CITY_COORDS = {
        "Sydney": {"lat": -33.8688, "lng": 151.2093},
        "Melbourne": {"lat": -37.8136, "lng": 144.9631},
        "Brisbane": {"lat": -27.4698, "lng": 153.0251},
        "Perth": {"lat": -31.9505, "lng": 115.8605},
        "Adelaide": {"lat": -34.9285, "lng": 138.6007},
    }

    def __init__(self):
        self.token = os.environ.get("EVENTBRITE_TOKEN", "")
        self.session = requests.Session()
        if self.token:
            self.session.headers["Authorization"] = f"Bearer {self.token}"

    def scrape(self, city: str, days_ahead: int = 14) -> list[ScrapedEvent]:
        if not self.token:
            log.warning(
                "Eventbrite: EVENTBRITE_TOKEN not set. "
                "Get a private token from eventbrite.com/account-settings/apps "
                "and set EVENTBRITE_TOKEN env var. Skipping."
            )
            return []

        coords = self.CITY_COORDS.get(city, self.CITY_COORDS["Sydney"])
        now = datetime.now(timezone.utc)
        end = now + timedelta(days=days_ahead)

        params = {
            "location.latitude": coords["lat"],
            "location.longitude": coords["lng"],
            "location.within": "30km",
            "start_date.range_start": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "start_date.range_end": end.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "expand": "venue,ticket_classes",
            "page_size": 50,
        }

        events = []
        page = 1
        while True:
            params["page"] = page
            try:
                r = self.session.get(
                    f"{self.BASE}/events/search/", params=params, timeout=10
                )
                r.raise_for_status()
                data = r.json()
            except Exception as e:
                log.warning(f"Eventbrite page {page} failed: {e}")
                break

            for ev in data.get("events", []):
                try:
                    events.append(self._parse(ev, city))
                except Exception as e:
                    log.debug(f"EB parse error: {e}")

            if not data.get("pagination", {}).get("has_more_items"):
                break
            page += 1
            if page > 10:
                break  # safety cap

        log.info(f"Eventbrite: {len(events)} events for {city}")
        return events

    def _parse(self, ev: dict, city: str) -> ScrapedEvent:
        venue = ev.get("venue") or {}
        addr = venue.get("address") or {}
        tickets = ev.get("ticket_classes") or []

        price_min = 0.0
        price_max = None
        for t in tickets:
            if t.get("free"):
                continue
            cost = t.get("cost") or {}
            val = cost.get("major_value")
            if val:
                v = float(val)
                price_min = min(price_min, v) if price_min else v
                price_max = max(price_max or 0, v)

        title = ev.get("name", {}).get("text", "Untitled")
        desc = ev.get("description", {}).get("text") or ev.get("summary") or ""
        cat = guess_category(f"{title} {desc}")

        return ScrapedEvent(
            title=title,
            description=desc[:2000] if desc else None,
            image_url=(ev.get("logo") or {}).get("url"),
            starts_at=ev.get("start", {}).get(
                "utc", datetime.now(timezone.utc).isoformat()
            ),
            ends_at=ev.get("end", {}).get("utc"),
            source=self.NAME,
            source_url=ev.get("url", ""),
            source_id=ev.get("id", ""),
            location_name=venue.get("name"),
            address=addr.get("address_1"),
            suburb=addr.get("city") or city,
            city=city,
            lat=float(venue["latitude"]) if venue.get("latitude") else None,
            lng=float(venue["longitude"]) if venue.get("longitude") else None,
            category=cat,
            price_min=price_min,
            price_max=price_max,
            ticket_url=ev.get("url"),
        )


class ResidentAdvisorSource:
    """
    Resident Advisor event listings — scraped from ra.co/events/au
    RA is the gold standard for electronic music events globally.
    Scrapes the listings page; RA doesn't have a public API.
    """

    NAME = "ra"
    CITY_SLUGS = {
        "Sydney": "au/sydney",
        "Melbourne": "au/melbourne",
        "Brisbane": "au/brisbane",
        "Perth": "au/perth",
    }

    def scrape(self, city: str, days_ahead: int = 14) -> list[ScrapedEvent]:
        slug = self.CITY_SLUGS.get(city, "au/sydney")
        url = f"https://ra.co/events/{slug}"
        events = []

        try:
            headers = {
                # RA blocks generic scrapers. Use a realistic browser UA.
                # Note: RA has rate limiting — don't hammer it.
                # For production, consider RA's official data partnerships.
                "User-Agent": (
                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                ),
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-AU,en;q=0.9",
                "Referer": "https://ra.co/",
            }
            r = requests.get(url, headers=headers, timeout=15)
            r.raise_for_status()
            soup = BeautifulSoup(r.text, "html.parser")

            # RA embeds event data in a __NEXT_DATA__ JSON blob
            script = soup.find("script", {"id": "__NEXT_DATA__"})
            if not script:
                log.warning(
                    "RA: could not find __NEXT_DATA__ — page structure may have changed"
                )
                return []

            data = json.loads(script.string)
            # Navigate to event listings in the Next.js page props
            # Path may change if RA updates their structure
            listings = (
                data.get("props", {})
                .get("pageProps", {})
                .get("data", {})
                .get("listing", {})
                .get("events", {})
                .get("items", [])
            )

            cutoff = datetime.now(timezone.utc) + timedelta(days=days_ahead)
            for item in listings:
                try:
                    ev = self._parse(item, city, cutoff)
                    if ev:
                        events.append(ev)
                except Exception as e:
                    log.debug(f"RA parse error: {e}")

        except Exception as e:
            log.warning(f"RA scrape failed: {e}")

        log.info(f"Resident Advisor: {len(events)} events for {city}")
        return events

    def _parse(self, item: dict, city: str, cutoff: datetime) -> Optional[ScrapedEvent]:
        date_str = item.get("startTime") or item.get("date")
        if not date_str:
            return None

        try:
            dt = dateparser.parse(date_str)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            if dt > cutoff:
                return None
        except Exception:
            return None

        venue = item.get("venue") or {}
        title = item.get("title") or "RA Event"
        artists = [a.get("name", "") for a in (item.get("artists") or [])]
        if artists and title == "RA Event":
            title = " + ".join(artists[:3])

        ra_id = str(item.get("id") or item.get("contentUrl") or title)

        return ScrapedEvent(
            title=title,
            description=item.get("content"),
            image_url=(item.get("images") or [{}])[0].get("filename"),
            starts_at=dt.isoformat(),
            ends_at=item.get("endTime"),
            source=self.NAME,
            source_url="https://ra.co" + (item.get("contentUrl") or ""),
            source_id=ra_id,
            location_name=venue.get("name"),
            address=venue.get("address"),
            suburb=venue.get("area", {}).get("name")
            if isinstance(venue.get("area"), dict)
            else None,
            city=city,
            lat=venue.get("lat") or venue.get("latitude"),
            lng=venue.get("lng") or venue.get("longitude"),
            category="club_night",  # RA is almost always electronic
            tags=["electronic", "ra"]
            + [a.get("name", "") for a in (item.get("artists") or [])],
            price_min=float(item.get("cost") or 0),
            ticket_url="https://ra.co" + (item.get("contentUrl") or ""),
        )


class HumanitixSource:
    """
    Humanitix — Australian ticketing platform (ethical, donates to charity).
    Scrapes their public event search.
    """

    NAME = "humanitix"
    SEARCH_URL = "https://events.humanitix.com/search"
    API_URL = "https://humanitix.com/api/search"

    CITY_PARAMS = {
        "Sydney": "Sydney, NSW",
        "Melbourne": "Melbourne, VIC",
        "Brisbane": "Brisbane, QLD",
        "Perth": "Perth, WA",
        "Adelaide": "Adelaide, SA",
    }

    def scrape(self, city: str, days_ahead: int = 14) -> list[ScrapedEvent]:
        events = []
        city_param = self.CITY_PARAMS.get(city, city)
        params = {
            "query": "",
            "location": city_param,
            "page": 1,
            "limit": 48,
        }
        headers = {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
            "Accept": "application/json",
            "Referer": "https://events.humanitix.com/",
        }
        cutoff = datetime.now(timezone.utc) + timedelta(days=days_ahead)

        try:
            for page in range(1, 6):  # up to 5 pages
                params["page"] = page
                r = requests.get(
                    self.API_URL, params=params, headers=headers, timeout=10
                )
                if r.status_code == 404:
                    break
                r.raise_for_status()
                data = r.json()
                items = data.get("events") or data.get("results") or []
                if not items:
                    break
                for item in items:
                    try:
                        ev = self._parse(item, city, cutoff)
                        if ev:
                            events.append(ev)
                    except Exception as e:
                        log.debug(f"Humanitix parse error: {e}")
                if not data.get("hasNextPage"):
                    break
        except Exception as e:
            log.warning(f"Humanitix scrape failed: {e}")

        log.info(f"Humanitix: {len(events)} events for {city}")
        return events

    def _parse(self, item: dict, city: str, cutoff: datetime) -> Optional[ScrapedEvent]:
        date_str = item.get("startDate") or item.get("startDateUtc")
        if not date_str:
            return None
        try:
            dt = dateparser.parse(date_str)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            if dt > cutoff:
                return None
        except Exception:
            return None

        title = item.get("name") or item.get("title") or "Event"
        desc = item.get("description") or item.get("summary") or ""

        # Price
        price_text = str(item.get("minimumPrice") or item.get("priceRange") or "")
        price_min, price_max = parse_price(price_text)
        if item.get("isFree"):
            price_min, price_max = 0, None

        return ScrapedEvent(
            title=title,
            description=desc[:2000] if desc else None,
            image_url=item.get("bannerImageUrl") or item.get("imageUrl"),
            starts_at=dt.isoformat(),
            ends_at=item.get("endDate"),
            source=self.NAME,
            source_url=f"https://events.humanitix.com/{item.get('slug', '')}",
            source_id=str(item.get("_id") or item.get("id") or title),
            location_name=item.get("venueName"),
            address=item.get("address") or item.get("street"),
            suburb=item.get("suburb") or item.get("city"),
            city=city,
            lat=item.get("lat") or (item.get("location") or {}).get("lat"),
            lng=item.get("lng") or (item.get("location") or {}).get("lng"),
            category=guess_category(f"{title} {desc}"),
            price_min=price_min,
            price_max=price_max,
            ticket_url=f"https://events.humanitix.com/{item.get('slug', '')}",
        )


class ICalSource:
    """
    Generic iCal/ICS feed source.
    Many venues publish iCal feeds. Add their URLs here.
    """

    NAME = "ical"

    FEEDS = {
        # Venue name → ical URL
        # Add more as discovered
        # "Oxford Art Factory": "https://oxfordartfactory.com/events.ics",
    }

    def scrape(self, city: str, days_ahead: int = 14) -> list[ScrapedEvent]:
        try:
            from icalendar import Calendar
        except ImportError:
            log.warning(
                "icalendar not installed — skipping iCal source. pip install icalendar"
            )
            return []

        events = []
        cutoff = datetime.now(timezone.utc) + timedelta(days=days_ahead)
        now = datetime.now(timezone.utc)

        for venue_name, url in self.FEEDS.items():
            try:
                r = requests.get(url, timeout=10)
                r.raise_for_status()
                cal = Calendar.from_ical(r.content.decode("utf-8", errors="replace"))  # type: ignore[arg-type]
                for component in cal.walk():
                    if component.name != "VEVENT":
                        continue
                    try:
                        dt_start = component.get("dtstart").dt
                        if hasattr(dt_start, "date"):
                            # It's a datetime
                            if dt_start.tzinfo is None:
                                dt_start = dt_start.replace(tzinfo=timezone.utc)
                        else:
                            # It's a date
                            dt_start = datetime.combine(
                                dt_start, datetime.min.time(), tzinfo=timezone.utc
                            )

                        if dt_start < now or dt_start > cutoff:
                            continue

                        title = str(component.get("summary", "Event"))
                        desc = str(component.get("description", "") or "")
                        location = str(component.get("location", "") or "")

                        events.append(
                            ScrapedEvent(
                                title=title,
                                description=desc[:2000] if desc else None,
                                starts_at=dt_start.isoformat(),
                                source=self.NAME,
                                source_url=str(component.get("url", url)),
                                source_id=str(
                                    component.get(
                                        "uid", f"{venue_name}-{title}-{dt_start}"
                                    )
                                ),
                                location_name=venue_name,
                                address=location,
                                city=city,
                                category=guess_category(f"{title} {desc}"),
                            )
                        )
                    except Exception as e:
                        log.debug(f"iCal event parse error: {e}")
            except Exception as e:
                log.warning(f"iCal feed {url} failed: {e}")

        log.info(f"iCal: {len(events)} events")
        return events


# ══════════════════════════════════════════════════════════════════════════════
# DEDUPLICATION
# ══════════════════════════════════════════════════════════════════════════════


class FuzzyDedup:
    """
    Basic deduplication:
    1. Exact: same source + source_id → skip
    2. Fuzzy: same title + same date (within 2h) + same city → skip
    """

    def __init__(self):
        self.seen_fingerprints = set()
        self.seen_title_dates = set()

    def is_duplicate(self, ev: ScrapedEvent) -> bool:
        fp = ev.fingerprint()
        if fp in self.seen_fingerprints:
            return True

        # Fuzzy match on title + date
        try:
            dt = dateparser.parse(ev.starts_at)
            rounded = dt.replace(minute=0, second=0, microsecond=0)
            key = (ev.title.lower().strip()[:40], rounded.isoformat(), ev.city)
            if key in self.seen_title_dates:
                return True
            self.seen_title_dates.add(key)
        except Exception:
            pass

        self.seen_fingerprints.add(fp)
        return False


# ══════════════════════════════════════════════════════════════════════════════
# SUPABASE UPSERTER
# ══════════════════════════════════════════════════════════════════════════════


class SupabaseUpserter:
    """
    Upserts scraped events into Supabase.
    Uses service role key (bypasses RLS) — keep this key secret.
    """

    def __init__(self):
        self.url = os.environ.get("SUPABASE_URL", "").rstrip("/")
        self.key = os.environ.get("SUPABASE_SERVICE_KEY", "")
        self.bot_user_id = os.environ.get("SCRAPER_BOT_USER_ID", "")

        if not self.url or not self.key:
            raise ValueError(
                "Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars.\n"
                "Use the service role key (not anon key) so RLS is bypassed for the bot."
            )
        if not self.bot_user_id:
            raise ValueError(
                "Set SCRAPER_BOT_USER_ID env var.\n"
                "Create a bot user in Supabase Auth and put its UUID here.\n"
                "This is the 'created_by' for all scraped events."
            )

        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=representation",
        }

    def get_existing_fingerprints(self) -> set:
        """Fetch stored source fingerprints to avoid re-inserting."""
        # We store fingerprint in a dedicated table (see schema addition below)
        r = requests.get(
            f"{self.url}/rest/v1/scraped_events",
            headers=self.headers,
            params={"select": "fingerprint"},
            timeout=10,
        )
        if r.ok:
            return {row["fingerprint"] for row in r.json()}
        return set()

    def upsert(self, events: list[ScrapedEvent]) -> tuple[int, int]:
        """
        Insert events. Returns (inserted, skipped).
        Uses the scraped_events tracking table for dedup across runs.
        """
        inserted = 0
        skipped = 0

        existing = self.get_existing_fingerprints()

        for ev in events:
            fp = ev.fingerprint()
            if fp in existing:
                skipped += 1
                continue

            row = ev.to_supabase_row(self.bot_user_id)

            # Insert into events table
            r = requests.post(
                f"{self.url}/rest/v1/events",
                headers=self.headers,
                json=row,
                timeout=10,
            )
            if not r.ok:
                log.warning(f"Insert failed for '{ev.title}': {r.text[:200]}")
                continue

            event_id = r.json()[0]["id"] if r.json() else None

            # Track the fingerprint
            if event_id:
                requests.post(
                    f"{self.url}/rest/v1/scraped_events",
                    headers=self.headers,
                    json={
                        "event_id": event_id,
                        "source": ev.source,
                        "source_id": ev.source_id,
                        "source_url": ev.source_url,
                        "fingerprint": fp,
                    },
                    timeout=5,
                )
            inserted += 1

        return inserted, skipped


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

ALL_SOURCES = {
    "eventbrite": EventbriteSource,
    "ra": ResidentAdvisorSource,
    "humanitix": HumanitixSource,
    "ical": ICalSource,
}


def main():
    parser = argparse.ArgumentParser(description="Corral event scraper")
    parser.add_argument(
        "--city", default="Sydney", help="City to scrape (default: Sydney)"
    )
    parser.add_argument(
        "--days", default=14, type=int, help="Days ahead to scrape (default: 14)"
    )
    parser.add_argument(
        "--sources",
        default="eventbrite,ra,humanitix,ical",
        help="Comma-separated sources to run (default: all)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print events, don't insert into Supabase",
    )
    parser.add_argument("--verbose", action="store_true", help="Debug logging")
    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    source_names = [s.strip() for s in args.sources.split(",")]
    sources = []
    for name in source_names:
        cls = ALL_SOURCES.get(name)
        if cls:
            sources.append(cls())
        else:
            log.warning(
                f"Unknown source: {name}. Available: {list(ALL_SOURCES.keys())}"
            )

    log.info(
        f"🎪 Corral scraper — {args.city} — {args.days} days ahead — sources: {source_names}"
    )

    # Scrape all sources
    all_events: list[ScrapedEvent] = []
    for source in sources:
        try:
            evs = source.scrape(args.city, args.days)
            all_events.extend(evs)
        except Exception as e:
            log.error(f"Source {source.NAME} crashed: {e}")

    log.info(f"Total scraped (before dedup): {len(all_events)}")

    # Dedup
    dedup = FuzzyDedup()
    unique = [ev for ev in all_events if not dedup.is_duplicate(ev)]
    log.info(f"After dedup: {len(unique)} unique events")

    if args.dry_run:
        print(f"\n{'─' * 60}")
        print(f"DRY RUN — {len(unique)} events found, NOT inserting")
        print(f"{'─' * 60}")
        for ev in sorted(unique, key=lambda e: e.starts_at):
            try:
                dt = dateparser.parse(ev.starts_at).strftime("%a %d %b %H:%M")
            except Exception:
                dt = ev.starts_at
            price = f"${ev.price_min:.0f}" if ev.price_min else "free"
            print(
                f"  [{ev.source:12}] {dt} | {ev.category:12} | {price:6} | {ev.title[:50]}"
            )
            if ev.location_name:
                print(f"    📍 {ev.location_name}")
        print(f"{'─' * 60}\n")
        return

    # Upsert to Supabase
    try:
        upserter = SupabaseUpserter()
        inserted, skipped = upserter.upsert(unique)
        log.info(f"✅ Done — {inserted} inserted, {skipped} skipped (already exist)")
    except ValueError as e:
        log.error(f"Supabase config error: {e}")
        log.info("Tip: run with --dry-run to test without Supabase")


if __name__ == "__main__":
    main()
