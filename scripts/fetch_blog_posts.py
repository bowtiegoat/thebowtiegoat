#!/usr/bin/env python3
"""
Fetches the BowtieGOAT Substack RSS feed and writes the latest posts to
js/blog-posts.json, which the blog page renders as a scroll-loaded feed.

Run manually with `python3 scripts/fetch_blog_posts.py`, or automatically
on a schedule via .github/workflows/update-blog.yml.
"""
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from pathlib import Path

FEED_URL = "https://bowtiegoat.substack.com/feed"
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "js" / "blog-posts.json"
CONTENT_NS = {"content": "http://purl.org/rss/1.0/modules/content/"}

# Substack auto-inserts one of these mid-post ("Subscribe now") — strip them
# since the site isn't wiring up a subscribe flow from post content yet.
SUBSCRIBE_BUTTON_RE = re.compile(
    r'<p class="button-wrapper"[^>]*data-component-name="ButtonCreateButton"[^>]*>.*?</p>',
    re.DOTALL,
)


def format_date(pub_date: str) -> str:
    dt = parsedate_to_datetime(pub_date)
    return f"{dt.strftime('%B')} {dt.day}, {dt.year}"


def clean_content(html: str) -> str:
    return SUBSCRIBE_BUTTON_RE.sub("", html).strip()


def fetch_posts():
    req = urllib.request.Request(
        FEED_URL,
        headers={"User-Agent": "BowtieGOAT-Website-Blog-Sync/1.0 (+https://www.thebowtiegoat.com)"},
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        xml_bytes = response.read()

    root = ET.fromstring(xml_bytes)
    channel = root.find("channel")
    posts = []
    for index, item in enumerate(channel.findall("item")):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        pub_date = item.findtext("pubDate")
        excerpt = (item.findtext("description") or "").strip()

        if not (title and link and pub_date):
            continue

        post = {
            "title": title,
            "url": link,
            "date": format_date(pub_date),
            "excerpt": excerpt,
        }

        # Only the most recent post needs full content -- it's the one
        # shown in full on the blog page; the rest stay excerpt-only.
        if index == 0:
            full_html = item.findtext("content:encoded", namespaces=CONTENT_NS)
            if full_html:
                post["content"] = clean_content(full_html)

        posts.append(post)

    return posts


def main():
    posts = fetch_posts()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(posts, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(posts)} posts to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
