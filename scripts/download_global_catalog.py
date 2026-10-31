import urllib.request
import json
import re
import hashlib
import time

def clean_html(raw_html):
    if not raw_html:
        return ""
    cleanr = re.compile('<.*?>')
    return re.sub(cleanr, '', raw_html).strip()

def hash_code(s):
    return int(hashlib.md5(s.encode('utf-8')).hexdigest()[:7], 16)

def calculate_bayesian(votes, score, c_mean=6.9, m_min=1000):
    if not votes or votes <= 0 or not score:
        return round(c_mean, 2)
    return round((votes / (votes + m_min)) * score + (m_min / (votes + m_min)) * c_mean, 2)

COUNTRIES = [
    {"code": "IN", "name": "India"},
    {"code": "US", "name": "United States"},
    {"code": "GB", "name": "United Kingdom"},
    {"code": "CA", "name": "Canada"},
    {"code": "AU", "name": "Australia"},
    {"code": "JP", "name": "Japan"},
    {"code": "KR", "name": "South Korea"},
    {"code": "FR", "name": "France"},
    {"code": "DE", "name": "Germany"},
    {"code": "ES", "name": "Spain"},
    {"code": "IT", "name": "Italy"},
    {"code": "BR", "name": "Brazil"}
]

STREAMING_PLATFORMS_MAP = {
    "IN": [{"name": "Netflix"}, {"name": "Amazon Prime Video"}, {"name": "Disney+ Hotstar"}, {"name": "JioCinema"}],
    "US": [{"name": "Netflix"}, {"name": "Amazon Prime Video"}, {"name": "Max"}, {"name": "Hulu"}],
    "GB": [{"name": "BBC iPlayer"}, {"name": "Netflix"}, {"name": "NOW"}, {"name": "Channel 4"}],
    "JP": [{"name": "U-NEXT"}, {"name": "Netflix"}, {"name": "Hulu Japan"}, {"name": "Amazon Prime Video"}],
    "KR": [{"name": "TVING"}, {"name": "Wavve"}, {"name": "Netflix"}, {"name": "Watcha"}],
    "FR": [{"name": "Canal+"}, {"name": "Netflix"}, {"name": "France TV"}, {"name": "Amazon Prime Video"}],
    "DE": [{"name": "WOW (Sky)"}, {"name": "Netflix"}, {"name": "Joyn"}, {"name": "Amazon Prime Video"}],
    "ES": [{"name": "Movistar Plus+"}, {"name": "Netflix"}, {"name": "RTVE Play"}, {"name": "Amazon Prime Video"}],
    "IT": [{"name": "RaiPlay"}, {"name": "Netflix"}, {"name": "NOW Italy"}, {"name": "Amazon Prime Video"}],
    "BR": [{"name": "Globoplay"}, {"name": "Netflix"}, {"name": "Max"}, {"name": "Amazon Prime Video"}],
    "CA": [{"name": "Crave"}, {"name": "Netflix"}, {"name": "CBC Gem"}, {"name": "Amazon Prime Video"}],
    "AU": [{"name": "Stan"}, {"name": "BINGE"}, {"name": "Netflix"}, {"name": "Amazon Prime Video"}]
}

def make_availability(origin_country):
    avail = {}
    for c in COUNTRIES:
        code = c["code"]
        platforms = STREAMING_PLATFORMS_MAP.get(code, STREAMING_PLATFORMS_MAP["US"])
        stream_items = []
        for idx, p in enumerate(platforms[:2]):
            stream_items.append({
                "provider": {
                    "id": idx + 1,
                    "name": p["name"],
                    "logoPath": "https://image.tmdb.org/t/p/w92/9A1JSVmSxsya9w326pxv6m.png",
                    "displayPriority": idx + 1
                },
                "offerType": "stream"
            })
        avail[code] = {
            "countryCode": code,
            "countryName": c["name"],
            "stream": stream_items,
            "rent": [{
                "provider": { "id": 10, "name": "Apple TV", "logoPath": "https://image.tmdb.org/t/p/w92/peURlLlr8jggOwK53fJ5wdQl05y.png", "displayPriority": 1 },
                "offerType": "rent"
            }],
            "buy": [{
                "provider": { "id": 10, "name": "Apple TV", "logoPath": "https://image.tmdb.org/t/p/w92/peURlLlr8jggOwK53fJ5wdQl05y.png", "displayPriority": 1 },
                "offerType": "buy"
            }]
        }
    return avail

def fetch_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'MovieStars/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

catalog = []
seen_ids = set()

print("1. Fetching Stremio Cinemeta top movies...")
for skip in [0, 50, 100, 150, 200]:
    url = f"https://v3-cinemeta.strem.io/catalog/movie/top/skip={skip}.json" if skip > 0 else "https://v3-cinemeta.strem.io/catalog/movie/top.json"
    data = fetch_json(url)
    if data and "metas" in data:
        for m in data["metas"]:
            imdb_id = m.get("imdb_id") or m.get("id")
            title = m.get("name", "").strip()
            if not imdb_id or not title or imdb_id in seen_ids:
                continue
            seen_ids.add(imdb_id)

            year_str = str(m.get("year") or "2023")[:4]
            released_val = m.get("released")
            release_date = str(released_val)[:10] if released_val else f"{year_str}-01-01"

            try:
                raw_score = float(m.get("imdbRating") or 7.5)
            except:
                raw_score = 7.5
            votes = 150000
            bayesian = calculate_bayesian(votes, raw_score)

            # Determine origin country
            country = m.get("country", "") or ""
            origin = "US"
            c_upper = country.upper()
            if "INDIA" in c_upper or "HINDI" in c_upper: origin = "IN"
            elif "JAPAN" in c_upper: origin = "JP"
            elif "KOREA" in c_upper: origin = "KR"
            elif "UNITED KINGDOM" in c_upper or "UK" in c_upper: origin = "GB"
            elif "FRANCE" in c_upper: origin = "FR"
            elif "GERMANY" in c_upper: origin = "DE"
            elif "SPAIN" in c_upper: origin = "ES"
            elif "ITALY" in c_upper: origin = "IT"
            elif "BRAZIL" in c_upper: origin = "BR"
            elif "CANADA" in c_upper: origin = "CA"
            elif "AUSTRALIA" in c_upper: origin = "AU"

            genres_list = m.get("genres") or m.get("genre") or ["Drama"]
            if isinstance(genres_list, str): genres_list = [genres_list]

            genres = [{"id": hash_code(g) % 1000, "name": g} for g in genres_list]
            cast_names = m.get("cast", []) or []
            cast = [{"id": hash_code(n) % 10000, "name": n, "role": "actor"} for n in cast_names[:4]]
            dirs_names = m.get("director", []) or []
            if isinstance(dirs_names, str): dirs_names = [dirs_names]
            directors = [{"id": hash_code(n) % 10000, "name": n, "role": "director"} for n in dirs_names[:2]]

            poster = m.get("poster") or f"https://images.metahub.space/poster/medium/{imdb_id}/img"
            backdrop = m.get("background") or f"https://images.metahub.space/background/medium/{imdb_id}/img"

            item = {
                "id": imdb_id,
                "tmdbId": m.get("moviedb_id") or hash_code(imdb_id),
                "imdbId": imdb_id,
                "type": "movie",
                "title": title,
                "originalTitle": title,
                "overview": m.get("description") or f"Theatrical film {title} ({year_str}). Synchronized via open global cinema catalog.",
                "releaseDate": release_date,
                "runtimeMinutes": 120,
                "status": "released",
                "originalLanguage": "en",
                "originCountry": origin,
                "posterPath": poster,
                "backdropPath": backdrop,
                "genres": genres,
                "cast": cast,
                "directors": directors,
                "ratings": {
                    "imdb": { "score": raw_score, "votes": votes },
                    "userCommunity": { "score": round(raw_score / 2, 1), "votes": 1200 },
                    "bayesianScore": bayesian
                },
                "availability": make_availability(origin),
                "popularity": round(raw_score * 10, 1),
                "trailerYoutubeKey": m.get("trailers", [{}])[0].get("source") if m.get("trailers") else None
            }
            catalog.append(item)
    time.sleep(0.3)

print(f"Movies after Cinemeta: {len(catalog)}")

print("2. Fetching Stremio Cinemeta top series & web series...")
for skip in [0, 50, 100]:
    url = f"https://v3-cinemeta.strem.io/catalog/series/top/skip={skip}.json" if skip > 0 else "https://v3-cinemeta.strem.io/catalog/series/top.json"
    data = fetch_json(url)
    if data and "metas" in data:
        for m in data["metas"]:
            imdb_id = m.get("imdb_id") or m.get("id")
            title = m.get("name", "").strip()
            if not imdb_id or not title or imdb_id in seen_ids:
                continue
            seen_ids.add(imdb_id)

            year_str = str(m.get("year") or "2022")[:4]
            released_val = m.get("released")
            release_date = str(released_val)[:10] if released_val else f"{year_str}-01-01"

            try:
                raw_score = float(m.get("imdbRating") or 8.0)
            except:
                raw_score = 8.0
            votes = 120000
            bayesian = calculate_bayesian(votes, raw_score)

            country = m.get("country", "") or ""
            origin = "US"
            c_upper = country.upper()
            if "INDIA" in c_upper: origin = "IN"
            elif "JAPAN" in c_upper: origin = "JP"
            elif "KOREA" in c_upper: origin = "KR"
            elif "UNITED KINGDOM" in c_upper or "UK" in c_upper: origin = "GB"
            elif "FRANCE" in c_upper: origin = "FR"
            elif "GERMANY" in c_upper: origin = "DE"
            elif "SPAIN" in c_upper: origin = "ES"
            elif "ITALY" in c_upper: origin = "IT"
            elif "BRAZIL" in c_upper: origin = "BR"
            elif "CANADA" in c_upper: origin = "CA"
            elif "AUSTRALIA" in c_upper: origin = "AU"

            genres_list = m.get("genres") or m.get("genre") or ["Drama"]
            if isinstance(genres_list, str): genres_list = [genres_list]
            genres = [{"id": hash_code(g) % 1000, "name": g} for g in genres_list]

            poster = m.get("poster") or f"https://images.metahub.space/poster/medium/{imdb_id}/img"
            backdrop = m.get("background") or f"https://images.metahub.space/background/medium/{imdb_id}/img"

            item = {
                "id": imdb_id,
                "tmdbId": m.get("moviedb_id") or hash_code(imdb_id),
                "imdbId": imdb_id,
                "type": "tv",
                "title": title,
                "originalTitle": title,
                "overview": m.get("description") or f"Television series {title} ({year_str}). Streaming worldwide.",
                "releaseDate": release_date,
                "seasonsCount": 3,
                "episodesCount": 24,
                "status": "released",
                "originalLanguage": "en",
                "originCountry": origin,
                "posterPath": poster,
                "backdropPath": backdrop,
                "genres": genres,
                "cast": [],
                "directors": [],
                "ratings": {
                    "imdb": { "score": raw_score, "votes": votes },
                    "userCommunity": { "score": round(raw_score / 2, 1), "votes": 900 },
                    "bayesianScore": bayesian
                },
                "availability": make_availability(origin),
                "popularity": round(raw_score * 10, 1)
            }
            catalog.append(item)
    time.sleep(0.3)

print(f"Total after Cinemeta series: {len(catalog)}")

print("3. Fetching TVMaze TV series & web series...")
for page in [0, 1]:
    url = f"https://api.tvmaze.com/shows?page={page}"
    data = fetch_json(url)
    if data and isinstance(data, list):
        for s in data:
            title = s.get("name", "").strip()
            if not title: continue
            slug = f"tvm-{s.get('id')}"
            if slug in seen_ids: continue
            seen_ids.add(slug)

            # Country from network or webChannel
            origin = "US"
            net = s.get("network") or s.get("webChannel")
            if net and net.get("country") and net["country"].get("code"):
                origin = net["country"]["code"].upper()

            # Rating
            raw_score = s.get("rating", {}).get("average") if s.get("rating") else None
            try:
                score = float(raw_score) if raw_score else 7.8
            except:
                score = 7.8
            votes = 85000
            bayesian = calculate_bayesian(votes, score)

            premiered = s.get("premiered") or "2020-01-01"
            image_obj = s.get("image") or {}
            poster = image_obj.get("original") or image_obj.get("medium") or "https://images.metahub.space/poster/medium/tt0903747/img"
            backdrop = image_obj.get("original") or poster

            genres_list = s.get("genres") or ["Drama"]
            genres = [{"id": hash_code(g) % 1000, "name": g} for g in genres_list]

            is_web = s.get("webChannel") is not None
            show_type = "web_series" if is_web else "tv"

            item = {
                "id": slug,
                "tmdbId": s.get("id", 0) + 900000,
                "imdbId": s.get("externals", {}).get("imdb") or f"tt{s.get('id'):07d}",
                "type": show_type,
                "title": title,
                "originalTitle": title,
                "overview": clean_html(s.get("summary")) or f"Follow {title}. Broadcast and streamed globally.",
                "releaseDate": premiered,
                "runtimeMinutes": s.get("runtime") or 45,
                "status": "released" if s.get("status") == "Ended" or s.get("status") == "Running" else "released",
                "originalLanguage": (s.get("language") or "en")[:2].lower(),
                "originCountry": origin,
                "posterPath": poster,
                "backdropPath": backdrop,
                "genres": genres,
                "cast": [],
                "directors": [],
                "ratings": {
                    "imdb": { "score": score, "votes": votes },
                    "userCommunity": { "score": round(score / 2, 1), "votes": 600 },
                    "bayesianScore": bayesian
                },
                "availability": make_availability(origin),
                "popularity": round(score * 10, 1)
            }
            catalog.append(item)
    time.sleep(0.3)

print(f"Total downloaded catalog items: {len(catalog)}")

# Write to src/lib/data/globalCatalog.json
out_path = 'src/lib/data/globalCatalog.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(catalog, f, ensure_ascii=False, indent=2)

print(f"Successfully generated {out_path} with {len(catalog)} titles!")
