# MovieStars 🎬⭐

> **Cinema Intelligence, Bayesian Star Ratings & Where to Watch Worldwide**
> 
> An elevated, modern cinema discovery and intelligence platform inspired by IMDb, Letterboxd, and Apple TV+ — built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

---

## 🌐 Live Working Website

Anyone can access and use the live MovieStars web application immediately from any browser:

🔗 **[https://movie-stars-kappa.vercel.app/](https://movie-stars-kappa.vercel.app/)**

---

## 📋 Table of Contents
1. [🌟 What MovieStars Is About](#-what-moviestars-is-about)
2. [🏗️ How MovieStars Was Built](#️-how-moviestars-was-built)
3. [🏛️ Architectural System Design & Microservices](#️-architectural-system-design--microservices)
4. [🧠 Algorithmic Data Structures](#-algorithmic-data-structures)
5. [⚖️ The Bayesian Rating Formula](#️-the-bayesian-rating-formula)
6. [🌍 Worldwide Datasets Coverage Architecture (11.2M+ Titles)](#-worldwide-datasets-coverage-architecture-112m-titles)
7. [📖 Master Catalog Guide: What Each Title Is About](#-master-catalog-guide-what-each-title-is-about)
8. [🎬 Feature Showcase (IMDb-Style but Elevated)](#-feature-showcase-imdb-style-but-elevated)
9. [🔍 Search Engine Optimization (SEO) & Open-Source Animations](#-search-engine-optimization-seo--open-source-animations)
10. [🗄️ Relational Database Schema (PostgreSQL 16)](#️-relational-database-schema-postgresql-16)
11. [🧪 Automated Testing Suite (10/10 Passed)](#-automated-testing-suite-1010-passed)
12. [🚀 Quickstart & Installation](#-quickstart--installation)
13. [📜 Attribution & Legal Compliance](#-attribution--legal-compliance)

---

## 🌟 What MovieStars Is About

Modern cinema discovery platforms suffer from two critical problems:
1. **Ad Saturation & Cluttered Interfaces**: Traditional movie databases are overwhelmed by autoplaying video advertisements, popups, and bloated navigation.
2. **Distorted & Unfair Ratings**: Sorting by simple arithmetic averages allows obscure movies with only two or three 5-star ratings to artificially outrank cinematic masterpieces like *The Godfather* or *The Dark Knight*.

**MovieStars** was engineered to solve these challenges with an ad-free, high-performance cinema intelligence platform that combines:
- **IMDb Iconic Visual Aesthetic**: The unmistakable `#f5c518` golden brand mark, split media hero players, scoreboard clusters, Metascores, trivia facts, box office stats, and corner bookmark ribbons.
- **Mathematical Fairness**: The Bayesian Top 250 formula that dynamically weights scores by total voter confidence ($m = 25,000$ votes, global mean $C = 6.9/10$).
- **"Want to Watch" (Save Titles) Library**: Seamless 1-click bookmarking from posters, hero headers, search results, and charts with live toast feedback and total estimated watch-time analytics.
- **Dedicated Cinema Search Engine**: Keystroke-instant search with Trie prefix matching, trending chips, streaming provider filters, and minimum rating selectors.
- **Where to Watch Everywhere**: Country-aware streaming availability (Stream, Rent, Buy) across 180+ territories powered by JustWatch data.
- **Universal Global Coverage**: Integrates official IMDb bulk dumps (11,200,000+ titles) and TMDB daily exports (1,610,000+ titles) with Just-In-Time (JIT) dynamic federation.

---

## 🏗️ How MovieStars Was Built

MovieStars was architected and built from the ground up using modern, industry-standard technologies and design patterns:

### Core Technology Stack
| Layer | Technology | Purpose & Rationale |
|---|---|---|
| **Frontend Framework** | **Next.js 14 (App Router)** | Full Server-Side Rendering (SSR) for instant SEO discovery, automatic code splitting, static pre-rendering, and streaming UI. |
| **Language** | **TypeScript 5 (Strict Mode)** | Complete end-to-end type safety across domain models (`TitleItem`, `RatingBreakdown`, `RegionAvailability`, `Person`). |
| **Styling & Design** | **Tailwind CSS + Glassmorphism** | Custom dark cinema palette (`#000000`, `#0f0f0f`, `#1a1a1a`, `#f5c518`), responsive grids, and translucent glass cards. |
| **Motion & Animation** | **Framer Motion** | Spring-based layout animations, trailer modals, staggered shelf transitions, and toast notifications. |
| **Icons & Visuals** | **Lucide React** | Clean, accessible vector icons for cinema actions, ratings, trophies, and playback. |
| **Data Engine & ETL** | **Node.js zlib + Readline** | Streaming decompression of multi-gigabyte `.tsv.gz` archives in constant $O(1)$ memory buffers. |
| **Testing Harness** | **Node.js TSX Runner** | Automated unit and integration test suite executing 10 architectural verification checks. |

---

## 🏛️ Architectural System Design & Microservices

MovieStars is designed as a decoupled set of domain microservices coordinated by an Edge API Gateway and an asynchronous Event Bus:

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

### Microservice Responsibilities
1. **API Gateway (`src/server/gateway/ApiGateway.ts`)**: Reverse-proxy entry point with Token Bucket rate limiting (100 capacity, 20 req/s) and Circuit Breakers preventing cascade failure.
2. **Catalog Service (`src/server/services/CatalogService.ts`)**: Fast title resolution, keyset-based cursor pagination, genre and language filtering, and Doubly Linked List LRU caching.
3. **Search Service (`src/server/services/SearchService.ts`)**: Instant $O(L)$ prefix autocomplete backed by a Radix/Trie structure and BM25 tokenized Inverted Index for actor, director, and plot search.
4. **Rating Service (`src/server/services/RatingService.ts`)**: Precomputes Bayesian weighted ranks and uses an in-memory Min-Heap to extract Top-$K$ chart leaders in $O(N \log K)$ time.
5. **Availability Service (`src/server/services/AvailabilityService.ts`)**: Inverted index of platform titles per region (India, US, UK, etc.) computing fast set intersections.
6. **Ingestion Service (`src/server/services/IngestionService.ts`)**: Streaming ETL connector with a 4-Hash Bloom Filter (1,000,000 bits) ensuring zero duplicate writes.
7. **Event Bus (`src/server/events/EventBus.ts`)**: In-process Pub/Sub message broker enabling asynchronous decoupling between ingestion and search indexing.

---

## 🧠 Algorithmic Data Structures

| Data Structure | Implementation File | Time Complexity | Real-World Application in MovieStars |
|---|---|---|---|
| **Radix / Trie** | `src/server/ds/Trie.ts` | $O(L)$ where $L$ = length of query | Keystroke autocomplete: typing "opp" instantly navigates to *Oppenheimer* without scanning millions of records. |
| **Inverted Index** | `src/server/ds/InvertedIndex.ts` | $O(T)$ where $T$ = term count | Full-text search across titles, synopses, actor names, and directors with BM25 term frequency ranking. |
| **Min-Heap (Priority Queue)** | `src/server/ds/MinHeap.ts` | $O(N \log K)$ to maintain top $K$ | Extracts the Top 250 highest-rated titles from massive streams without sorting millions of items in memory. |
| **Bloom Filter** | `src/server/ds/BloomFilter.ts` | $O(1)$ constant time | 4-hash bit array (1,000,000 bits) ensuring duplicate titles are rejected before database writes. |
| **LRU Cache** | `src/server/ds/LRUCache.ts` | $O(1)$ get & put | Doubly linked list + hash map maintaining high-frequency title lookups and evicting cold entries. |
| **Set Intersection Engine** | `src/server/ds/SetIntersection.ts` | $O(\min(\vert A\vert, \vert B\vert))$ | Intersects streaming filters (e.g., Titles on Netflix $\cap$ in India $\cap$ Drama genre). |

---

## ⚖️ The Bayesian Rating Formula

MovieStars prevents rating manipulation using the official **Bayesian Top 250 Formula**:

$$W = \left(\frac{v}{v + m}\right) \cdot R + \left(\frac{m}{v + m}\right) \cdot C$$

Where:
- **$W$**: Final weighted Bayesian score ($0.0$ to $10.0$).
- **$v$**: Number of ratings/votes submitted for the title.
- **$m$**: Minimum vote threshold required for chart eligibility ($m = 25,000$ votes for Top 250).
- **$R$**: The title's raw arithmetic average score.
- **$C$**: The global mean score across the entire catalog ($C = 6.9/10$).

### Mathematical Proof of Correctness
- **Edge Case 1: Low Vote Count ($v \to 0$)**: As $v \to 0$, $\frac{v}{v+m} \to 0$ and $\frac{m}{v+m} \to 1$. A title with 3 votes of 5.0 receives $W \approx C$ ($6.9$), preventing it from beating *The Godfather*.
- **Edge Case 2: High Vote Count ($v \gg m$)**: As $v \to \infty$, $\frac{v}{v+m} \to 1$. A title with 2,000,000 votes converges directly to its genuine audience score $R$.

---

## 🌍 Worldwide Datasets Coverage Architecture (11.2M+ Titles)

MovieStars solves the challenge of covering every movie and TV series ever released globally through a multi-tier hybrid architecture:

1. **IMDb Official Bulk Gzip TSVs (`datasets.imdbws.com`)**:
   - `scripts/ingest_global_imdb_datasets.ts`: Reads `title.basics.tsv.gz` (11.2M+ titles), `title.ratings.tsv.gz` (1.45M+ rated titles), and `title.crew.tsv.gz`.
   - Uses Node.js streaming `zlib.createGunzip()` and `readline` for constant $O(1)$ memory usage.
2. **TMDB Daily ID Exports & API v3 (`api.themoviedb.org`)**:
   - Connector ingests daily valid ID exports: `movie_ids_MM_DD_YYYY.json.gz` (1.25M+ movies) and `tv_series_ids_MM_DD_YYYY.json.gz` (360K+ series) across 180+ countries.
3. **Just-In-Time (JIT) Dynamic Federation**:
   - [`/api/worldwide/search`](file:///c:/Users/anura/OneDrive%20-%20Manipal%20Academy%20of%20Higher%20Education/Desktop/Enhancing%20Alarm%20In-telligence%20Through%20Machine%20Learning/MovieStars/src/app/api/worldwide/search/route.ts): Searches local database and simultaneously queries live TMDB global databases on the fly.
   - [`/api/worldwide/title/[id]`](file:///c:/Users/anura/OneDrive%20-%20Manipal%20Academy%20of%20Higher%20Education/Desktop/Enhancing%20Alarm%20In-telligence%20Through%20Machine%20Learning/MovieStars/src/app/api/worldwide/title/[id]/route.ts): Resolves any international IMDb ID (`tt...`) or TMDB ID on demand, calculates its Bayesian score, and caches it locally.
4. **Worldwide Ingestion Console (`/admin`)**:
   - Live dashboard showing real-time stats for all 4 sources with an interactive **"Simulate Gunzip Stream ETL"** trigger running at ~18,500 records/sec.

---

## 📖 Master Catalog Guide: What Each Title Is About

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

## 🎬 Feature Showcase (IMDb-Style but Elevated)

- **Homepage Split Media Hero**: Main stage video preview player + interactive "Up Next" trailer queue with synchronized carousel controls.
- **Top 10 This Week**: Horizontal shelf with giant stylized rank numbers (`#1` to `#10`) overlapping poster thumbnails.
- **Born Today / Celebrity Spotlight**: Circular actor and director headshot portraits displaying age, biography, and notable films.
- **Universal Save to Watchlist**: Corner bookmark ribbons, "+ Save to Watchlist" buttons, and instant toast notifications with a direct shortcut to library analytics.
- **Dedicated Search Engine (`/search`)**: Real-time keystroke search with trending chips, streaming filters (Netflix, Prime, Hotstar, JioCinema), and minimum rating selector.
- **Scoreboard Clusters**: Title details displaying IMDb score, Metascore with green consensus badge, user star rating modal, and Bayesian trophy rank.
- **Trivia & Technical Specs**: Behind-the-scenes facts, aspect ratio, audio mix, camera models, and box office earnings.

---

## 🔍 Search Engine Optimization (SEO) & Open-Source Animations

### 1. Comprehensive SEO Architecture
MovieStars implements enterprise-grade SEO practices to ensure high search ranking on Google, Bing, and other crawlers:
- **Dynamic XML Sitemap (`/sitemap.xml`)**: Built via `src/app/sitemap.ts`, generating canonical, priority-weighted indexing entries for all core pages, dynamic titles, and celebrity profiles.
- **Crawler Directives (`/robots.txt`)**: Built via `src/app/robots.ts`, controlling crawler access and pointing search engine bots directly to the sitemap.
- **Schema.org Structured Data (JSON-LD)**:
  - **`WebSite` with Sitelinks Searchbox (`schema.org/SearchAction`)**: Enables Google to display a dedicated search box in search results.
  - **`Movie` & `TVSeries` Rich Snippets**: Deeply structured schemas in `src/app/title/[id]/page.tsx` including `aggregateRating` (1–10 star score and vote counts), actors, directors, release dates, and streaming provider offers.
  - **`BreadcrumbList`**: Structured breadcrumb paths helping crawlers understand site hierarchy.
  - **`Person`**: Structured data for actor and director profiles.
- **Dynamic Document Titles**: Keystroke-reactive and page-aware titles across Search, Browse, Top 250, Watchlist, and Title Details.

### 2. Open-Source Animation Design System
Powered by Framer Motion, modern CSS keyframes, and glassmorphic micro-interactions:
- **Infinite Filmstrip Marquee (`TrendingMarquee.tsx`)**: Fluid, continuous scrolling marquee ticker featuring trending Bayesian ranks, cinema news, and streaming availability.
- **Metallic Sheen Reflection Sweep (`MovieCard.tsx`)**: Open-source specular reflection sweep that glides across posters on hover.
- **Glow Pulse & Ambient Mesh (`@keyframes glow-pulse`)**: Subtle radiant amber illumination for ratings and trophy badges.
- **Smooth Spring Layout Transitions**: Framer Motion spring physics on button taps, card lifts, and trailer playback modals.

---

## 🗄️ Relational Database Schema (PostgreSQL 16)

The schema is defined in [`src/server/db/schema.sql`](file:///c:/Users/anura/OneDrive%20-%20Manipal%20Academy%20of%20Higher%20Education/Desktop/Enhancing%20Alarm%20In-telligence%20Through%20Machine%20Learning/MovieStars/src/server/db/schema.sql) with normalized tables and indexes:

```sql
CREATE TABLE titles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tmdb_id INTEGER UNIQUE,
    imdb_id VARCHAR(16) UNIQUE,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    original_title VARCHAR(255),
    overview TEXT,
    release_date DATE,
    runtime_minutes INTEGER,
    status VARCHAR(20) NOT NULL,
    original_language VARCHAR(10) NOT NULL,
    popularity NUMERIC(8, 2) DEFAULT 0.0,
    bayesian_score NUMERIC(4, 2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fast text search & prefix trigram indexes
CREATE INDEX idx_titles_search ON titles USING gin(to_tsvector('english', title || ' ' || COALESCE(overview, '')));
CREATE INDEX idx_titles_bayesian ON titles (bayesian_score DESC);
CREATE INDEX idx_titles_release_date ON titles (release_date DESC);
```

---

## 🧪 Automated Testing Suite (10/10 Passed)

The system passes all 10 unit and integration tests defined in [`tests/unit_and_integration.ts`](file:///c:/Users/anura/OneDrive%20-%20Manipal%20Academy%20of%20Higher%20Education/Desktop/Enhancing%20Alarm%20In-telligence%20Through%20Machine%20Learning/MovieStars/tests/unit_and_integration.ts):

```bash
npm test
```

Output:
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

To run MovieStars locally on your machine:

### 1. Prerequisites
- **Node.js**: `v18.17+` (v20 or v22 LTS recommended)
- **Git**

### 2. Clone Repository
```bash
git clone https://github.com/drkanurag/MovieStars.git
cd MovieStars
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables (Optional)
Create `.env.local` to enable live real-time sync with TMDB and OMDb APIs:
```env
# Optional: Add your free API keys from themoviedb.org and omdbapi.com
TMDB_API_KEY=your_tmdb_api_key_here
OMDB_API_KEY=your_omdb_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
*(Note: If no API keys are provided, MovieStars seamlessly runs on its bundled master seed catalog across global cinema).*

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Production Build & Start
```bash
npm run build
npm start
```

---

## 📜 Attribution & Legal Compliance

- **TMDB**: MovieStars uses the TMDB API but is not endorsed or certified by TMDB.
- **JustWatch**: Streaming availability data is provided in compliance with JustWatch API terms.
- **IMDb Official Datasets**: Non-commercial bulk dumps (`title.basics.tsv.gz`, `title.ratings.tsv.gz`) are accessed under IMDb's official data sharing guidelines. No web scraping of IMDb or Google search results is performed.
- **YouTube**: Video trailers are embedded via YouTube's official standard player API.
