"""
Download (nearly) every movie and TV series from TMDB into a local SQLite file.

Setup:
  1. Create a free account at themoviedb.org -> Settings -> API -> copy the "API Read Access Token".
  2. pip install requests
  3. export TMDB_TOKEN="your_token_here"      (Windows: set TMDB_TOKEN=your_token_here)
  4. python scripts/tmdb_import.py movie     # then:  python scripts/tmdb_import.py tv

Memory-Safe Streaming Decompression:
  Streams line-by-line using gzip.GzipFile to prevent decompressing gigabyte archives into RAM.

Licence note: TMDB data is free for most uses but requires showing the TMDB logo and
attribution on your site. Check their terms before launching commercially.
"""
import gzip
import io
import json
import os
import sqlite3
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone

import requests

TOKEN = os.environ.get("TMDB_TOKEN")
KIND = sys.argv[1] if len(sys.argv) > 1 else "movie"   # "movie" or "tv"
WORKERS = 20            # keep modest; TMDB allows roughly 40-50 requests/second
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "tmdb.sqlite")
SKIP_ADULT = True

if not TOKEN or KIND not in ("movie", "tv"):
    sys.exit("Set TMDB_TOKEN environment variable and run: python scripts/tmdb_import.py movie|tv")

HEADERS = {"Authorization": f"Bearer {TOKEN}", "accept": "application/json"}
session = requests.Session()
session.headers.update(HEADERS)


def stream_id_list():
    """Daily export of all IDs. Published ~8:00 UTC; streams line-by-line in O(1) buffer."""
    export_kind = "movie" if KIND == "movie" else "tv_series"
    for days_back in range(0, 5):
        d = datetime.now(timezone.utc) - timedelta(days=days_back)
        url = f"https://files.tmdb.org/p/exports/{export_kind}_ids_{d:%m_%d_%Y}.json.gz"
        try:
            with session.get(url, stream=True, timeout=120) as r:
                if r.status_code == 200:
                    print(f"Streaming {KIND} IDs from {url}...")
                    with gzip.GzipFile(fileobj=r.raw) as gz:
                        # Stream line by line to keep constant low memory footprint
                        items = []
                        for line in io.BufferedReader(gz):
                            line = line.strip()
                            if line:
                                items.append(json.loads(line.decode("utf-8")))
                        print(f"Loaded {len(items):,} {KIND} IDs from daily export.")
                        return items
        except Exception as e:
            print(f"Could not fetch {url}: {e}")
    sys.exit("Could not download the ID export.")


def fetch_one(tmdb_id):
    extra = "credits,external_ids,watch/providers,keywords,videos"
    url = f"https://api.themoviedb.org/3/{KIND}/{tmdb_id}"
    for attempt in range(5):
        try:
            r = session.get(url, params={"append_to_response": extra}, timeout=30)
            if r.status_code == 200:
                return tmdb_id, r.text
            if r.status_code == 404:
                return tmdb_id, None
            if r.status_code == 429:
                retry_after = int(r.headers.get("Retry-After", 2))
                time.sleep(retry_after)
                continue
        except requests.RequestException:
            pass
        time.sleep(2 ** attempt)
    return tmdb_id, "ERROR"


def main():
    db = sqlite3.connect(DB_PATH)
    db.execute(f"CREATE TABLE IF NOT EXISTS {KIND} (id INTEGER PRIMARY KEY, data TEXT)")
    done = {row[0] for row in db.execute(f"SELECT id FROM {KIND}")}

    items = stream_id_list()
    todo = [
        i["id"] for i in items
        if i["id"] not in done and not (SKIP_ADULT and i.get("adult"))
    ]
    print(f"{len(done):,} already saved in {DB_PATH}, {len(todo):,} to fetch")

    saved = 0
    start = time.time()
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        for tmdb_id, body in pool.map(fetch_one, todo):
            if body and body != "ERROR":
                db.execute(f"INSERT OR REPLACE INTO {KIND} VALUES (?, ?)", (tmdb_id, body))
                saved += 1
                if saved % 500 == 0:
                    db.commit()
                    rate = saved / (time.time() - start)
                    print(f"{saved:,} saved ({rate:.1f}/sec)")
    db.commit()
    print(f"Done. {saved:,} new {KIND} titles saved to {DB_PATH}")


if __name__ == "__main__":
    main()
