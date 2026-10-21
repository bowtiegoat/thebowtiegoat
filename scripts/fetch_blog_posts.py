#!/usr/bin/env python3
"""
Fetches the BowtieGOAT Substack RSS feed and writes the latest posts to
js/blog-posts.json, which the blog page renders as a scroll-loaded feed.

Run manually with `python3 scripts/fetch_blog_posts.py`, or automatically
on a schedule via .github/workflows/update-content.yml.
"""
import json
import re
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import quote

FEED_URL = "https://bowtiegoat.substack.com/feed"
# Substack blocks GitHub's servers outright (403 even with browser headers),
# so when the direct request fails, read Substack's own post list (its JSON
# API) through Jina Reader, a free public relay that fetches the page from
# its own servers. (The earlier relay, rss2json, began blocking automated
# requests in October 2026.)
SITE_URL = "https://bowtiegoat.substack.com"
RELAY_URL = "https://r.jina.ai/"
RELAY_HEADERS = {"X-Return-Format": "text"}  # pass Substack's JSON through as-is
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "js" / "blog-posts.json"
CONTENT_NS = {"content": "http://purl.org/rss/1.0/modules/content/"}

# Substack returns 403 Forbidden to requests that look automated, which is
# what GitHub's servers got with a custom User-Agent. Look like a browser.
REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
    ),
    "Accept": "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}
ATTEMPTS = 3

# Substack auto-inserts one of these mid-post ("Subscribe now") — strip them
# since the site isn't wiring up a subscribe flow from post content yet.
SUBSCRIBE_BUTTON_RE = re.compile(
    r'<p class="button-wrapper"[^>]*data-component-name="ButtonCreateButton"[^>]*>.*?</p>',
    re.DOTALL,
)


def format_date(dt: datetime) -> str:
    return f"{dt.strftime('%B')} {dt.day}, {dt.year}"


def clean_content(html: str) -> str:
    return SUBSCRIBE_BUTTON_RE.sub("", html).strip()


def download(url: str, headers=None) -> bytes:
    req = urllib.request.Request(url, headers={**REQUEST_HEADERS, **(headers or {})})
    for attempt in range(1, ATTEMPTS + 1):
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                return response.read()
        except (urllib.error.HTTPError, urllib.error.URLError) as err:
            if attempt == ATTEMPTS:
                raise
            print(f"Attempt {attempt} failed ({err}); retrying...")
            time.sleep(10 * attempt)


def items_from_feed():
    """Reads the Substack RSS feed directly."""
    channel = ET.fromstring(download(FEED_URL)).find("channel")
    for item in channel.findall("item"):
        pub_date = item.findtext("pubDate")
        yield {
            "title": item.findtext("title"),
            "link": item.findtext("link"),
            "date": parsedate_to_datetime(pub_date) if pub_date else None,
            "description": item.findtext("description"),
            "content": item.findtext("content:encoded", namespaces=CONTENT_NS),
        }


def relay_json(path: str):
    return json.loads(download(RELAY_URL + SITE_URL + path, RELAY_HEADERS))


def items_from_relay():
    """Reads Substack's post list through the relay. The list has no post
    text, so the newest post's full text is loaded on its own."""
    posts = relay_json("/api/v1/archive?sort=new&limit=20")
    if not isinstance(posts, list):
        raise ValueError("the relay did not return Substack's post list")
    for index, post in enumerate(posts):
        content = None
        if index == 0 and post.get("slug"):
            content = relay_json(f"/api/v1/posts/{post['slug']}").get("body_html")
        pub_date = post.get("post_date")
        yield {
            "title": post.get("title"),
            "link": post.get("canonical_url"),
            "date": datetime.fromisoformat(pub_date.replace("Z", "+00:00")) if pub_date else None,
            "description": post.get("description") or post.get("subtitle"),
            "content": content,
        }


def fetch_items():
    """Returns (items, complete). complete is False for the relay, whose list
    may be shorter than the direct feed's."""
    try:
        return list(items_from_feed()), True
    except (urllib.error.HTTPError, urllib.error.URLError, ET.ParseError) as err:
        print(f"Direct Substack feed failed ({err}); trying the Jina relay...")
    return list(items_from_relay()), False


def fetch_posts():
    items, complete = fetch_items()
    posts = []
    for index, item in enumerate(items):
        title = (item["title"] or "").strip()
        link = (item["link"] or "").strip()
        excerpt = (item["description"] or "").strip()

        if not (title and link and item["date"]):
            continue

        post = {
            "title": title,
            "url": link,
            "date": format_date(item["date"]),
            "excerpt": excerpt,
        }

        # Only the most recent post needs full content -- it's the one
        # shown in full on the blog page; the rest stay excerpt-only.
        if index == 0 and item["content"]:
            post["content"] = clean_content(item["content"])

        posts.append(post)

    # The relay's list is shorter, so keep the older posts already on the
    # blog page rather than dropping them.
    if not complete and posts and OUTPUT_PATH.exists():
        seen = {post["url"] for post in posts}
        for old in json.loads(OUTPUT_PATH.read_text(encoding="utf-8")):
            if old["url"] not in seen:
                old.pop("content", None)
                posts.append(old)

    return posts


def main():
    try:
        posts = fetch_posts()
    except (urllib.error.HTTPError, urllib.error.URLError, ValueError) as err:
        print(f"Could not load the Substack feed ({err}); leaving js/blog-posts.json untouched.")
        sys.exit(1)
    if not posts:
        print("Substack feed had no posts; leaving js/blog-posts.json untouched.")
        return
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(posts, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(posts)} posts to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
