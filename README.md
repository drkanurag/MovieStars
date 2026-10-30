# MovieStars 🎬⭐

> **Cinema Intelligence, Bayesian Star Ratings & Where to Watch**
> 
> An elevated, modern cinema discovery and intelligence platform inspired by IMDb, Letterboxd, and Apple TV+ — built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

---

## 📋 Table of Contents
- [✨ Recent Changes & Enhancements Summary](#-recent-changes--enhancements-summary)
- [📖 Master Catalog Guide: What Each Title Is About](#-master-catalog-guide-what-each-title-is-about)
- [🏛️ Architectural System Design & Microservices](#️-architectural-system-design--microservices)
- [🧠 Algorithmic Data Structures](#-algorithmic-data-structures)
- [⚖️ Bayesian Top 250 Formula](#️-bayesian-top-250-formula)
- [🎬 IMDb-Style Feature Breakdown](#-imdb-style-feature-breakdown)
- [🗄️ Relational Database Schema](#️-relational-database-schema)
- [🧪 Automated Testing & Verification](#-automated-testing--verification)
- [🚀 Quickstart & Installation](#-quickstart--installation)
- [📜 Attribution & Legal Compliance](#-attribution--legal-compliance)

---

## ✨ Recent Changes & Enhancements Summary

To satisfy the full architectural blueprint and create an elevated, ad-free IMDb-style user experience, the following major updates and enhancements were made:

### 1. Brand Identity & Navigation Overhaul
- **Iconic Yellow Brand Badge**: Replaced generic text branding with IMDb's signature `#f5c518` yellow badge and bold typography (`MovieStars ★`).
- **IMDb-Style "Menu" Slide-Over Drawer**: Added a top navigation menu drawer that opens a comprehensive site directory (Movies, TV & Series, Watch & Lists, and System Design).
- **Search Bar Upgrade**: Implemented an IMDb-style category-aware search pill (`All ▾`, Titles, Celebs) with keyboard shortcuts (`/` or `⌘K`) triggering the instant prefix Trie search.
- **Top-Right Quick Controls**: Integrated a regional switcher (defaults to India 🇮🇳 with US, GB, CA, AU support), direct watchlist ribbon counter, and authentication state with Google sign-in simulation.

### 2. Homepage Split Media Hero & Curated Shelves
- **IMDb Split Media Hero**: Main stage featuring high-definition video trailer previews, poster thumbnail, title specs, IMDb rating scoreboard, and trailer playback.
- **Interactive "Up Next" Queue**: Real-time right-column playlist showing upcoming trailers with duration and play icons, enabling one-click switching and auto-advancing carousel progress.
- **"Top 10 on MovieStars this week"**: Horizontal carousel with giant stylized golden rank numbers (`1` to `10`) overlapping poster cards.
- **"Born Today / Celebrity Spotlight"**: Circular headshot portraits of actors and directors born today, with age, department, and top titles.
- **"Explore What's Streaming in India 🇮🇳"**: One-click platform filter strips for Netflix, Amazon Prime Video, Disney+ Hotstar, JioCinema, Zee5, and Apple TV+.

### 3. Title Detail Page (`/title/[id]`) - Elevated to IMDb Pro Standard
- **Scoreboard Cluster**: Header block featuring:
  - **IMDb Rating**: Yellow star icon, score `/10` (e.g. `8.9/10`), and formatted vote count (`810K`).
  - **Your Rating**: Interactive star button opening an in-place modal to rate titles (0.5 to 5.0 stars with confetti).
  - **Bayesian Rank Badge**: Gold trophy indicator showing rank and mathematically weighted score.
- **Poster Watchlist Ribbon**: Authentic IMDb-style corner bookmark ribbon (translucent dark with `+` when idle, golden yellow with checkmark when added) with instant local state synchronization.
- **Metascore Critic Consensus**: Green score badge (e.g. `88 Metascore - Universal Acclaim`) alongside critic review counts.
- **"Did You Know?" / Trivia**: Curated behind-the-scenes facts (e.g. Nolan's zero-CGI Trinity detonation, custom 65mm B&W IMAX stock, Bhagavad Gita preparation).
- **Box Office & Technical Specs**: Comprehensive stats for Budget, Worldwide Gross, Opening Weekend, Aspect Ratio, Sound Mix, and Camera equipment.
- **Where to Watch Widget**: Region-aware Stream, Rent, and Buy tabs with direct links and provider logos.
- **Top Cast & Crew**: Character headshot gallery in credits order, with real name and character name.

### 4. Top 250 Leaderboard (`/top-rated`)
- **IMDb Top 250 Chart Style**: Ranked list view featuring rank numbers (#1 Gold, #2 Silver, #3 Bronze), poster thumbnails with quick-add watchlist ribbons, release year, runtime, certification, IMDb rating, and Bayesian score.
- **Interactive Category Filtering**: Fast toggle between All Titles, Movies Only, TV Shows, and Web Series.
- **Multi-Field Sorting**: Sorter dropdown for Bayesian Rank, IMDb Rating, Total Votes, and Release Date.

### 5. Universal "Want to Watch" (Save Titles) & Global Feedback System
- **Prominent Save Button**: Added "+ Save to Watchlist (Want to Watch)" button prominently on the Title Detail page hero header and the Homepage Showcase Hero banner.
- **Global Watchlist Toast Feedback**: Whenever any movie or TV series is saved or removed (from cards, hero, detail page, or search modal), an interactive toast notification springs up in the bottom-right with a direct "View in My Library" shortcut.
- **Upgraded Library Experience (`/watchlist`)**:
  - Detailed library statistics: Saved Titles count, Total Estimated Watch Time (hours & minutes), Movies vs. TV Series breakdown.
  - Sub-filters: "All", "Movies", "Series".
  - One-click "Share List" to copy formatted titles to clipboard.
  - "Clear List" utility with confirmation prompt.
- **Instant Search Saving**: Users can bookmark/save titles directly from the Search Modal keystroke autocomplete suggestions.

### 6. Dedicated Search Engine (`/search`) & Live Autocomplete
- **Dedicated Search Engine Page (`/search`)**: Built an interactive search engine page with a prominent hero search bar, live results as you type, and category filters (All Formats, Movies, TV Shows, Web Series).
- **Popular Trending Search Chips**: One-click quick search tags for *Oppenheimer, Dune: Part Two, Breaking Bad, The Godfather, Mirzapur, 12th Fail, Interstellar, RRR, Christopher Nolan, Cillian Murphy*.
- **Multi-Facet Search Filtering**: Filter search results in real time by Streaming Platform (Netflix, Prime Video, Hotstar, JioCinema, Apple TV, Zee5) and Minimum Rating (★ 8.0+, ★ 8.5+, ★ 9.0+).
- **Interactive Navbar Autocomplete**: Real-time keystroke suggestions drop down directly beneath the navbar search input with title posters, year, type, Bayesian ratings, and "+ Save to Watchlist" button.
- **Mobile Bottom Bar & Navigation Integration**: Added an explicit "Search" link in the desktop navigation and a central "Search" icon in the mobile bottom dock for 1-tap access on any screen.

### 7. Worldwide Datasets Coverage Architecture (11,200,000+ Titles)
- **Official IMDb Daily Bulk Datasets (`datasets.imdbws.com`)**:
  - Streaming Gunzip ETL pipeline (`scripts/ingest_global_imdb_datasets.ts`) capable of decompressing and ingesting IMDb's full non-commercial dumps:
    - `title.basics.tsv.gz`: 11,200,000+ titles ever registered (movies, TV series, shorts, miniseries, web series, and anime since 1894).
    - `title.ratings.tsv.gz`: 1,450,000+ worldwide rated titles with vote counts.
    - `title.crew.tsv.gz` & `title.principals.tsv.gz`: Global cast, directors, and crew mapping.
    - `title.akas.tsv.gz`: Localized alternate titles in 80+ international languages.
  - Constant $O(1)$ memory buffer footprint using Node.js `zlib.createGunzip()` and `readline`.
- **TMDB Daily ID Exports & API v3 (`api.themoviedb.org`)**:
  - Ingestion connector for daily valid ID exports: `movie_ids_MM_DD_YYYY.json.gz` (1.25M+ movies) and `tv_series_ids_MM_DD_YYYY.json.gz` (360K+ series) across 180+ countries.
- **Just-In-Time (JIT) Dynamic Federation Engine**:
  - Real-time endpoint `/api/worldwide/search`: Multi-search federation that queries local cache and live worldwide databases simultaneously.
  - Real-time resolver `/api/worldwide/title/[id]`: Resolves any movie or TV series on-demand by TMDB ID or canonical IMDb ID (`tt...`), normalizes metadata into the `TitleItem` schema, and caches it in memory.
- **Expanded International Cinema Catalog**:
  - Enriched master database with all-time cinematic masterworks across the globe:
    - **Hollywood / Global**: *The Dark Knight*, *Pulp Fiction*, *Oppenheimer*, *Dune: Part Two*, *The Godfather*, *The Shawshank Redemption*, *Interstellar*, *Stranger Things*.
    - **Asian Cinema & Anime**: *Spirited Away* (Japan / Hayao Miyazaki), *Seven Samurai* (Japan / Akira Kurosawa), *Parasite* (South Korea / Bong Joon-ho).
    - **Indian & Regional Cinema**: *12th Fail*, *RRR*, *Baahubali 2: The Conclusion*, *Mirzapur*, *Sacred Games*, *Kalki 2898 AD*.
    - **Latin American Cinema**: *City of God* (Brazil / Fernando Meirelles & Kátia Lund).
- **Worldwide Coverage & Ingestion Console (`/admin`)**:
  - Interactive dashboard showing real-time stats across all 4 data sources.
  - Interactive "Simulate Gunzip Stream ETL" button with live progress tracking, ~18,500 records/sec throughput meter, and Bloom Filter zero-hash-collision monitoring.

### 8. Data Model & Enrichment
- Expanded `TitleItem` with `metascore`, `trivia`, `boxOffice`, `technicalSpecs`, and `trendingRank`.
- Added celebrity roster `CELEBRITIES_BORN_TODAY` with full biographical details and filmography mapping.

### 9. Comprehensive Summaries & "What It's About" Storylines
- **Universal Card Summaries**: `MovieCard` now embeds a 2-line clamped summary (`movie.overview`) on all cards across Homepage, Browse, Search, and Watchlist, so users can instantly know what any title is about.
- **Top Rated Chart (`/top-rated`)**: Each row features a dedicated synopsis snippet alongside ranking and streaming availability.
- **Title Detail Page (`/title/[id]`)**: Showcases an elevated **"Storyline • What It's About"** card featuring official tagline, premise & synopsis, genres, and format badges.
- **Master Catalog Guide**: Detailed storyline documentation added below covering every movie, TV show, and web series.

---

## 📖 Master Catalog Guide: What Each Title Is About

Here is a summary of all movies, TV series, and web series included in the master catalog and what each one is about:

| Title | Type & Year | Genres | What It&apos;s About (Premise & Storyline) |
|---|---|---|---|
| **Oppenheimer** | Movie (2023) | Drama, History | Follows theoretical physicist J. Robert Oppenheimer as he leads the secret Manhattan Project at Los Alamos to develop the first atomic bomb during World War II, and the intense post-war political fallout that stripped him of his security clearance. |
| **Dune: Part Two** | Movie (2024) | Sci-Fi, Adventure | Paul Atreides unites with Chani and the desert Fremen of Arrakis, embracing his prophetic destiny as Muad&apos;Dib while waging revenge against the conspirators of House Harkonnen who destroyed his family. |
| **The Godfather** | Movie (1972) | Crime, Drama | The aging patriarch of an organized crime dynasty, Don Vito Corleone, transfers control of his clandestine empire to his reluctant youngest son, Michael, transforming him from a decorated war hero into a ruthless mafia boss. |
| **The Shawshank Redemption** | Movie (1994) | Drama, Crime | Banker Andy Dufresne is wrongfully convicted of murdering his wife and sentenced to life at Shawshank State Penitentiary, where over two decades he forms a bond with fellow lifer Red and secretly orchestrates a miraculous bid for freedom. |
| **Breaking Bad** | TV Series (2008–2013) | Crime, Drama, Thriller | When mild-mannered high-school chemistry teacher Walter White is diagnosed with terminal lung cancer, he partners with former student Jesse Pinkman to cook and sell crystal meth, gradually transforming into the ruthless drug lord Heisenberg. |
| **Interstellar** | Movie (2014) | Sci-Fi, Adventure, Drama | As Earth faces catastrophic agricultural blight and dust storms, a team of NASA astronauts and former pilot Cooper travel through a wormhole near Saturn searching for a new habitable world across extreme time-dilation realms. |
| **The Dark Knight** | Movie (2008) | Action, Crime, Drama | Batman, Lt. Jim Gordon, and DA Harvey Dent dismantle Gotham City&apos;s mob syndicate until the psychotic criminal mastermind The Joker unleashes anarchy designed to test Gotham&apos;s moral sanity. |
| **Pulp Fiction** | Movie (1994) | Crime, Thriller | The lives of two philosophical hitmen, a gangster&apos;s captivating wife, an aging boxer, and a pair of diner bandits violently collide in four non-linear vignettes of violence, honor, and redemption in Los Angeles. |
| **Spirited Away** | Movie (2001) | Animation, Family, Fantasy | Ten-year-old Chihiro wanders into an enchanted bathhouse realm of spirits and deities; when her parents are transformed into pigs by the sorceress Yubaba, she must summon inner courage and work in the spirit bathhouse to free them. |
| **Parasite** | Movie (2019) | Drama, Thriller, Comedy | All unemployed, the impoverished Kim family schemes to become employed by the wealthy Park family by posing as unrelated, highly qualified tutors and domestic staff, triggering an unforeseen sequence of catastrophic class conflicts. |
| **Seven Samurai** | Movie (1954) | Action, Drama | In 16th-century feudal Japan, a destitute mountain farming village threatened by ruthless marauding bandits hires seven unemployed, masterless ronin samurai to train the villagers and defend their harvest. |
| **City of God** | Movie (2002) | Crime, Drama | In the violent favelas of Rio de Janeiro between the late 1960s and 1980s, two boys follow contrasting destinies: Rocket strives to become a news photographer while Li&apos;l Zé rises as an untouchable cocaine warlord. |
| **12th Fail** | Movie (2023) | Drama, Biography | Based on the true story of Manoj Kumar Sharma from Chambal, who overcomes extreme poverty, police brutality, and academic failure to restart his life and crack the world&apos;s toughest examination (UPSC) to become an IPS officer. |
| **Mirzapur** | Web Series (2018–) | Action, Crime, Drama | In the lawless badlands of eastern Uttar Pradesh, mafia don and carpet exporter Akhandanand &ldquo;Kaleen Bhaiya&rdquo; Tripathi rules the underworld, until two brothers challenge his volatile son Munna, sparking a blood-soaked war for dominion. |
| **RRR** | Movie (2022) | Action, Drama, History | In 1920s British colonial India, fierce tribal guardian Komaram Bheem and dedicated undercover officer Alluri Sitarama Raju forge an unbreakable friendship, unaware of each other&apos;s secret identities and anti-imperialist missions. |
| **Baahubali 2: The Conclusion** | Movie (2017) | Action, Fantasy, Drama | The epic revelation of the throne succession of Mahishmati kingdom, juxtaposing the noble reign of Amarendra Baahubali with the tragic conspiracy that forced the loyal warrior Kattappa to execute him. |
| **Sacred Games** | Web Series (2018–2019) | Crime, Mystery, Thriller | Disillusioned Mumbai police officer Sartaj Singh receives an anonymous phone call from notorious crime lord Ganesh Gaitonde, who gives him a 25-day deadline to unravel a sinister conspiracy and save Mumbai from total nuclear annihilation. |
| **Stranger Things** | TV Series (2016–) | Sci-Fi, Drama, Horror | When a young boy vanishes from a small Indiana town in 1983, his friends, family, and local sheriff uncover a secret government laboratory, a dark parallel dimension called the Upside Down, and a mysterious girl with telekinetic powers. |
| **Avengers: Secret Wars** | Movie (Upcoming 2027) | Action, Sci-Fi | Earth&apos;s mightiest champions and alternate universe variants collide on the patchwork world of Battleworld to defend existence against catastrophic multiversal incursion collapse. |
| **Kalki 2898 AD: Part 2** | Movie (Upcoming 2026) | Sci-Fi, Action, Mythology | In the post-apocalyptic future of Kasi, immortal warrior Ashwatthama and bounty hunter Bhairava unite with the Shambhala rebels to protect the divine mother and child against the tyrannical Supreme Yaskin. |
| **The Batman: Part II** | Movie (Upcoming 2026) | Action, Crime, Mystery | Bruce Wayne continues his psychological crusade through a flooded, lawless Gotham City as secret cabals and master criminals challenge his vigilante code. |

---

## 🏗️ Architectural System Design & Microservices

The application is engineered as a decoupled set of domain microservices coordinated by a centralized API Gateway and asynchronous Event Broker:

```
                          ┌───────────────────────────────┐
                          │   Client / Next.js Frontend   │
                          └───────────────┬───────────────┘
                                          │
                                          ▼
                          ┌───────────────────────────────┐
                          │          API Gateway          │
                          │   Token Bucket Rate Limiter   │
                          │        Circuit Breakers       │
                          └──────┬────┬────┬────┬────┬────┘
                                 │    │    │    │    │
          ┌──────────────────────┘    │    │    │    └──────────────────────┐
          ▼                           ▼    │    ▼                           ▼
┌──────────────────┐  ┌─────────────────┐  │  ┌──────────────────┐  ┌───────────────────┐
│ Catalog Service  │  │ Search Service  │  │  │ Rating Service   │  │ Ingestion Service │
│ • LRU Cache      │  │ • Trie Autocomp │  │  │ • Min-Heap Top-K │  │ • Bloom Filter    │
│ • Keyset Cursor  │  │ • Inverted Index│  │  │ • Bayesian Rank  │  │ • Rate Limiter    │
│ • Graph Overlap  │  │ • BM25 Ranking  │  │  │ • Leaderboards   │  │ • Sync Scheduler  │
└─────────┬────────┘  └────────┬────────┘  │  └────────┬─────────┘  └─────────┬─────────┘
          │                    │           ▼           │                      │
          │                    │  ┌─────────────────┐  │                      │
          │                    │  │  Availability   │  │                      │
          │                    │  │     Service     │  │                      │
          │                    │  │ • Set Intersect │  │                      │
          │                    │  │ • Region Filter │  │                      │
          │                    │  └────────┬────────┘  │                      │
          │                    │           │           │                      │
          └────────────────────┼───────────┴───────────┼──────────────────────┘
                               ▼                       ▼
                          ┌───────────────────────────────┐
                          │     Event Bus (Pub / Sub)     │
                          │ 'title:ingested', 'rating:upd'│
                          └───────────────────────────────┘
```

1. **API Gateway (`src/server/gateway/ApiGateway.ts`)**:
   - Single reverse-proxy entry point.
   - Enforces Token Bucket rate limiting (capacity: 100, refill: 20 req/s).
   - Wraps downstream calls with Circuit Breakers (`CLOSED`, `OPEN`, `HALF_OPEN`).
2. **Catalog Service (`src/server/services/CatalogService.ts`)**:
   - Manages titles, cast, crew, and genres.
   - In-memory **Doubly-Linked List LRU Cache** for $O(1)$ hot page access.
   - **Keyset / Cursor-Based Pagination** to eliminate expensive SQL offsets.
   - **Bipartite Movie Graph** for collaborative neighbor overlap recommendations.
3. **Search Service (`src/server/services/SearchService.ts`)**:
   - **Trie (Prefix Tree)** for $O(L)$ instant autocomplete.
   - **Inverted Index** with term frequency & field boosts (title: 4x, cast: 2x) for typo-tolerant full-text search.
   - Subscribes to `title:ingested` events to index new titles asynchronously.
4. **Rating Service (`src/server/services/RatingService.ts`)**:
   - Calculates the Bayesian weighted rating:
     $$W = \left(\frac{v}{v+m}\right) \times R + \left(\frac{m}{v+m}\right) \times C$$
   - **Min-Heap (Priority Queue)** for streaming Top-K leaderboards in $O(N \log K)$ time.
5. **Availability Service (`src/server/services/AvailabilityService.ts`)**:
   - Manages platform availability across regions (India default).
   - **Set Intersection Engine** that sorts input sets by ascending size to compute multi-criteria filters (`genre ∩ platform ∩ language`) in minimal comparisons.
6. **Ingestion & Sync Service (`src/server/services/IngestionService.ts`)**:
   - **Bloom Filter** (50,000 bits, 4 hash functions) for constant-time deduplication without querying primary storage.
   - External API rate-limiter and circuit breaker.
   - Publishes `title:ingested` to the event broker upon completion.

---

## 🧠 Algorithmic Data Structures

| Data Structure | Location | Time Complexity | Real-World Purpose |
|---|---|---|---|
| **Trie (Prefix Tree)** | `src/server/ds/Trie.ts` | $O(L)$ query | Instant keystroke autocomplete suggestions |
| **Inverted Index** | `src/server/ds/InvertedIndex.ts` | $O(\text{tokens})$ lookup | Full-text relevance ranking and keyword search |
| **Min-Heap (Priority Queue)** | `src/server/ds/MinHeap.ts` | $O(N \log K)$ | Streaming Top-250 leaderboard selection without full $O(N \log N)$ sort |
| **LRU Cache** | `src/server/ds/LRUCache.ts` | $O(1)$ get/put | Fast caching of hot title detail pages |
| **Bloom Filter** | `src/server/ds/BloomFilter.ts` | $O(k)$ test/add | Zero-latency deduplication for TMDB/IMDb IDs |
| **Bipartite Graph** | `src/server/ds/MovieGraph.ts` | $O(V + E)$ | Jaccard similarity recommendations across shared actors/genres |
| **Set Intersection Engine** | `src/server/ds/SetIntersection.ts` | $O(k \cdot \min(|S_i|))$ | Multi-filter intersection (genre $\cap$ platform $\cap$ language) |

---

## ⚖️ Bayesian Top 250 Formula

Sorting by raw arithmetic mean allows obscure titles with very few votes (e.g., 3 votes of 5.0) to outrank universally acclaimed cinema like *The Godfather* or *The Shawshank Redemption*.

MovieStars computes the Bayesian weighted score:

$$W = \left(\frac{v}{v + m}\right) \times R + \left(\frac{m}{v + m}\right) \times C$$

Where:
- **$W$**: Final weighted rank score
- **$R$**: Arithmetic mean rating of the title
- **$v$**: Number of ratings / votes for the title
- **$m$**: Minimum vote threshold ($25,000$ votes)
- **$C$**: Global catalog average rating across all titles ($6.9 / 10$)

When $v \to 0$, $W \to C$ (obscure titles shrink to the global mean). As $v \to \infty$, $W \to R$ (mass-market masterpieces converge to their true score).

---

## 🗄️ Relational Database Schema

The production PostgreSQL 16 schema is located at `src/server/db/schema.sql`:
- `titles`: id, tmdb_id, imdb_id, type, title, overview, release_date, runtime_minutes, status, language.
- `genres` & `title_genres`: Many-to-many relationship.
- `persons` & `credits`: Actors, directors, writers, and character names with billing orders.
- `providers` & `title_availability`: Streaming, rent, and buy offerings tagged by country ISO code (`IN`, `US`, etc.).
- `title_ratings`: Multi-source scores (IMDb, TMDB, Community, Bayesian).
- `user_ratings`, `reviews`, `watchlists`, and `release_reminders`.

---

## 🧪 Automated Testing & Verification

Run the test suite:
```powershell
npm.cmd test
```

Test Results (Section 11 Testing Checklist):
```
🧪 Running MovieStars System Test Suite (Section 11 Testing Checklist)...
  ✓ Rule: 3 votes of 5.0 must NOT beat The Godfather (2,000,000 votes of 9.2)
  ✓ Edge case: Zero votes returns the global catalog mean C
  ✓ Edge case: Very high vote count converges to the title raw average R
  ✓ Trie: Returns O(L) prefix autocomplete matches in order of score
  ✓ Min-Heap: Efficiently extracts streaming Top-3 titles in O(N log K)
  ✓ Bloom Filter: Constant-time membership test for deduplication
  ✓ LRU Cache: Evicts least-recently-used node when capacity is exceeded
  ✓ Set Intersection Engine: Computes intersection starting with smallest set
  ✓ Inverted Index: Tokenizes and ranks BM25 relevance matches
  ✓ Lifecycle: Correctly detects release date transitions

Results: 10 passed, 0 failed
```

---

## 🚀 Quickstart & Installation

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

*(Note: The platform includes a complete master catalog and runs immediately with zero API keys required!)*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📜 Attribution & Legal Compliance
- This product uses the **TMDB API** but is not endorsed or certified by TMDB.
- Streaming availability is powered by **JustWatch**.
- IMDb ratings referenced via **OMDb API**.
- Does **not** host, scrape, or stream pirated media. All links direct users to verified, official platforms.
