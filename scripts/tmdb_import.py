"""
Download (nearly) every movie and TV series from TMDB into a local SQLite file.

Setup:
  1. API Read Access Token is pre-configured or can be passed via TMDB_TOKEN environment variable.
  2. pip install requests
  3. python scripts/tmdb_import.py movie     # then:  python scripts/tmdb_import.py tv

It is resumable: stop it any time and run it again, it skips titles already saved.
Expect many hours for the full movie list (1M+ titles) because of API rate limits.
Each row stores the full JSON: details, credits, ratings, and where-to-watch providers.

Licence note: TMDB data is free for most uses but requires showing the TMDB logo and
attribution on your site. Check their terms before launching commercially.
"""
import gzip
import json
import os
import sqlite3
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone

import requests

DEFAULT_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2NTJmZDdjOWU3YzZjYmZlMDliNjFhNmJmOGY2MjNiNiIsIm5iZiI6MTc5MzM1MTYxNC4xLCJzdWIiOiI2YWU0NWZiZWI2Y2QyNGRiYzgzMWY2MGMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.16jY6jZAfiQe9UAoRDusBWddwXmzgjm3AF_Z0mlWyC0"
TOKEN = os.environ.get("TMDB_TOKEN") or DEFAULT_TOKEN
KIND = sys.argv[1] if len(sys.argv) > 1 else "movie"   # "movie" or "tv"
WORKERS = 20            # keep modest; TMDB allows roughly 40-50 requests/second
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "tmdb.sqlite")
SKIP_ADULT = True

if not TOKEN or KIND not in ("movie", "tv"):
    sys.exit("Set TMDB_TOKEN and run: python scripts/tmdb_import.py movie|tv")

HEADERS = {"Authorization": f"Bearer {TOKEN}", "accept": "application/json"}
session = requests.Session()
session.headers.update(HEADERS)


def download_id_list():
    """Daily export of all IDs. Published ~8:00 UTC; fall back to earlier days."""
    export_kind = "movie" if KIND == "movie" else "tv_series"
    for days_back in range(0, 5):
        d = datetime.now(timezone.utc) - timedelta(days=days_back)
        url = f"https://files.tmdb.org/p/exports/{export_kind}_ids_{d:%m_%d_%Y}.json.gz"
        try:
            r = requests.get(url, timeout=120)
            if r.status_code == 200:
                lines = gzip.decompress(r.content).decode("utf-8").splitlines()
                items = [json.loads(l) for l in lines if l.strip()]
                print(f"Got {len(items):,} {KIND} IDs from {url}")
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

    items = download_id_list()
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
