#!/usr/bin/env python3
"""
Fetches the BowtieGOAT YouTube channel's RSS feed and writes the most
recent long-form video (Shorts skipped) to js/latest-video.json, which
the homepage's "Latest Video" card renders from.

Run manually with `python3 scripts/fetch_latest_video.py`, or automatically
on a schedule via .github/workflows/update-content.yml.
"""
import json
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

CHANNEL_ID = "UCIx1-nFWFWFF9H6oNCfGqYQ"  # BowtieGOAT
FEED_URL = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "js" / "latest-video.json"

NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "media": "http://search.yahoo.com/mrss/",
    "yt": "http://www.youtube.com/xml/schemas/2015",
}


def format_date(iso_date: str) -> str:
    # e.g. "2026-04-27T20:44:59+00:00" -> "April 27, 2026"
    year, month, day = iso_date[:10].split("-")
    dt_month = ["January", "February", "March", "April", "May", "June", "July",
                "August", "September", "October", "November", "December"][int(month) - 1]
    return f"{dt_month} {int(day)}, {year}"


def fetch_latest_video():
    req = urllib.request.Request(
        FEED_URL,
        headers={"User-Agent": "BowtieGOAT-Website-Video-Sync/1.0 (+https://www.thebowtiegoat.com)"},
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        xml_bytes = response.read()

    root = ET.fromstring(xml_bytes)
    entries = root.findall("atom:entry", NS)

    for entry in entries:
        link = entry.find("atom:link", NS).get("href")
        if "/shorts/" in link:
            continue  # skip Shorts -- only interested in long-form videos

        title = (entry.findtext("atom:title", namespaces=NS) or "").strip()
        published = entry.findtext("atom:published", namespaces=NS) or ""
        video_id = entry.findtext("yt:videoId", namespaces=NS)

        media_group = entry.find("media:group", NS)
        description = ""
        views = None
        if media_group is not None:
            description = (media_group.findtext("media:description", namespaces=NS) or "").strip()
            stats = media_group.find("media:community/media:statistics", NS)
            if stats is not None:
                views = stats.get("views")

        return {
            "title": title,
            "url": link,
            "date": format_date(published) if published else "",
            "description": description,
            "views": int(views) if views else None,
            "thumbnail": f"https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg",
        }

    return None


def main():
    video = fetch_latest_video()
    if video is None:
        print("No long-form video found in feed; leaving existing file untouched.")
        return

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(video, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote latest video ({video['title']!r}) to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
