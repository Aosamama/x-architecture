#!/usr/bin/env python3
"""Collect the latest architecture headlines (title, short summary, thumbnail URL, link)
from public RSS feeds and write news.json. Runs on GitHub Actions; tolerant of feed failures."""
import json, re, sys, html, time, os
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

FEEDS = [
    ("ArchDaily", "https://www.archdaily.com/feed"),
    ("Dezeen", "https://www.dezeen.com/architecture/feed/"),
    ("Designboom", "https://www.designboom.com/architecture/feed/"),
    ("Archinect", "https://archinect.com/feed/1/news"),
]
UA = "Mozilla/5.0 (compatible; XArchNewsBot/1.0; +https://xarch.site)"
PER_FEED = 8
KEEP = 40
KEEP_DAYS = 21
OG_BUDGET = 14
NS = {"media": "http://search.yahoo.com/mrss/", "content": "http://purl.org/rss/1.0/modules/content/",
      "dc": "http://purl.org/dc/elements/1.1/", "atom": "http://www.w3.org/2005/Atom"}
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, "news.json")


def get(url, timeout=15):
    req = Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urlopen(req, timeout=timeout) as r:
        return r.read()


def clean(t, n=None):
    t = re.sub(r"<[^>]+>", " ", t or "")
    t = html.unescape(t)
    t = re.sub(r"\s+", " ", t).strip()
    if n and len(t) > n:
        t = t[:n].rsplit(" ", 1)[0].rstrip(",.;:- ") + "…"
    return t


def to_iso(s):
    if not s:
        return ""
    try:
        d = parsedate_to_datetime(s)
    except Exception:
        try:
            d = datetime.fromisoformat(s.replace("Z", "+00:00"))
        except Exception:
            return ""
    if d.tzinfo is None:
        d = d.replace(tzinfo=timezone.utc)
    return d.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def img_from(item):
    for tag in ("media:content", "media:thumbnail"):
        for el in item.findall(tag, NS):
            u = el.get("url")
            if u and (el.get("medium", "image") == "image") and not u.lower().endswith((".mp4", ".webm")):
                return u
    for el in item.findall("enclosure"):
        if (el.get("type") or "").startswith("image") and el.get("url"):
            return el.get("url")
    body = (item.findtext("content:encoded", "", NS) or "") + (item.findtext("description") or "")
    m = re.search(r"<img[^>]+src=[\"']([^\"']+)[\"']", html.unescape(body) if "&lt;img" in body else body)
    return m.group(1) if m else ""


def og_image(url):
    try:
        page = get(url, 12)[:400000].decode("utf-8", "ignore")
    except Exception:
        return ""
    for pat in (r"<meta[^>]+property=[\"']og:image[\"'][^>]+content=[\"']([^\"']+)",
                r"<meta[^>]+content=[\"']([^\"']+)[\"'][^>]+property=[\"']og:image[\"']"):
        m = re.search(pat, page, re.I)
        if m:
            return html.unescape(m.group(1))
    return ""


def key(u):
    return re.sub(r"[?#].*$", "", u or "").rstrip("/")


def main():
    items, budget = [], OG_BUDGET
    for name, url in FEEDS:
        try:
            root = ET.fromstring(get(url))
        except Exception as e:
            print("feed failed:", name, e, file=sys.stderr)
            continue
        n = 0
        for it in root.iter("item"):
            link = (it.findtext("link") or "").strip()
            title = clean(it.findtext("title"), 180)
            if not link or not title:
                continue
            desc = clean(it.findtext("description") or it.findtext("content:encoded", "", NS), 200)
            im = img_from(it)
            if not im and budget > 0:
                budget -= 1
                im = og_image(link)
            if im.startswith("//"):
                im = "https:" + im
            if not im.startswith("https://"):
                continue  # only keep stories with a usable (https) image
            items.append({"t": title, "x": desc, "s": name, "u": link, "i": im,
                          "d": to_iso(it.findtext("pubDate") or it.findtext("dc:date", "", NS)) or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")})
            n += 1
            if n >= PER_FEED:
                break
        print(name, n, "items")
    old = []
    try:
        old = json.load(open(OUT, encoding="utf-8")).get("items", [])
    except Exception:
        pass
    now = datetime.now(timezone.utc)
    cutoff = (now - timedelta(days=KEEP_DAYS)).strftime("%Y-%m-%dT%H:%M:%SZ")
    seen, merged = set(), []
    for n in items + [o for o in old if (o.get("d") or "") >= cutoff]:
        k = key(n.get("u"))
        if k in seen:
            continue
        seen.add(k)
        merged.append(n)
    merged.sort(key=lambda n: n.get("d") or "", reverse=True)
    merged = merged[:KEEP]
    if not items and old:
        print("no fresh items; keeping previous file")
        return
    out = {"updated": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "items": merged}
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print("wrote", len(merged), "items")


if __name__ == "__main__":
    main()
