-- =====================================================================
-- MovieStars Relational Database Schema (PostgreSQL 16)
-- Conforms to Section 5 & 6 of the System Architecture & Core Data Model
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. TITLE TABLE (Unified Movies, TV Shows, Web Series)
CREATE TABLE titles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tmdb_id INT UNIQUE NOT NULL,
    imdb_id VARCHAR(20) UNIQUE,
    title_type VARCHAR(20) NOT NULL CHECK (title_type IN ('movie', 'tv', 'web_series')),
    primary_title VARCHAR(255) NOT NULL,
    original_title VARCHAR(255),
    overview TEXT,
    release_date DATE,
    runtime_minutes INT,
    seasons_count INT DEFAULT 1,
    episodes_count INT,
    status VARCHAR(30) NOT NULL DEFAULT 'released' CHECK (status IN ('upcoming', 'released', 'in_production', 'cancelled')),
    original_language VARCHAR(10) NOT NULL DEFAULT 'en',
    poster_path VARCHAR(255),
    backdrop_path VARCHAR(255),
    trailer_youtube_key VARCHAR(50),
    certification VARCHAR(20),
    popularity NUMERIC(8, 2) DEFAULT 0.0,
    weighted_score NUMERIC(4, 2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_titles_release_date ON titles(release_date DESC);
CREATE INDEX idx_titles_popularity ON titles(popularity DESC);
CREATE INDEX idx_titles_weighted_score ON titles(weighted_score DESC);
CREATE INDEX idx_titles_type ON titles(title_type);
CREATE INDEX idx_titles_trgm ON titles USING gin(primary_title gin_trgm_ops);

-- 2. GENRES & TITLE_GENRE (Many-to-Many)
CREATE TABLE genres (
    id INT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE title_genres (
    title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
    genre_id INT NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (title_id, genre_id)
);

-- 3. PERSON & CREDITS (Cast, Directors, Writers, Creators)
CREATE TABLE persons (
    id INT PRIMARY KEY, -- tmdb_person_id
    imdb_person_id VARCHAR(20),
    name VARCHAR(255) NOT NULL,
    profile_path VARCHAR(255),
    known_for_department VARCHAR(50)
);

CREATE TABLE credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
    person_id INT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL CHECK (role IN ('actor', 'director', 'writer', 'creator')),
    character_name VARCHAR(255),
    billing_order INT DEFAULT 0
);

CREATE INDEX idx_credits_title ON credits(title_id);
CREATE INDEX idx_credits_person ON credits(person_id);

-- 4. SEASONS & EPISODES (For Series)
CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
    season_number INT NOT NULL,
    name VARCHAR(255),
    overview TEXT,
    poster_path VARCHAR(255),
    air_date DATE,
    episodes_count INT DEFAULT 0,
    UNIQUE (title_id, season_number)
);

CREATE TABLE episodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    episode_number INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    overview TEXT,
    still_path VARCHAR(255),
    air_date DATE,
    runtime_minutes INT,
    vote_average NUMERIC(3, 1),
    UNIQUE (season_id, episode_number)
);

-- 5. STREAMING PROVIDERS & AVAILABILITY (Where to Watch via JustWatch)
CREATE TABLE providers (
    id INT PRIMARY KEY, -- tmdb provider id
    name VARCHAR(100) NOT NULL,
    logo_path VARCHAR(255),
    display_priority INT DEFAULT 0
);

CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
    provider_id INT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    country_code VARCHAR(5) NOT NULL, -- 'IN', 'US', 'GB'
    offer_type VARCHAR(20) NOT NULL CHECK (offer_type IN ('stream', 'rent', 'buy')),
    stream_url VARCHAR(500),
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (title_id, provider_id, country_code, offer_type)
);

CREATE INDEX idx_avail_country_prov ON availability(country_code, provider_id);

-- 6. MULTI-SOURCE RATINGS
CREATE TABLE rating_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL -- 'imdb', 'tmdb', 'community'
);

CREATE TABLE title_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
    source_id INT NOT NULL REFERENCES rating_sources(id) ON DELETE CASCADE,
    score NUMERIC(4, 2) NOT NULL,
    vote_count INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (title_id, source_id)
);

-- 7. USERS, USER RATINGS & REVIEWS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    display_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
    stars NUMERIC(2, 1) NOT NULL CHECK (stars >= 0.5 AND stars <= 5.0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, title_id)
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
    headline VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'flagged', 'hidden')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
    list_type VARCHAR(20) NOT NULL CHECK (list_type IN ('watchlist', 'watched', 'favorite')),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, title_id, list_type)
);

CREATE TABLE release_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title_id UUID NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
    country_code VARCHAR(5) DEFAULT 'IN',
    is_sent BOOLEAN DEFAULT FALSE,
    notify_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, title_id)
);

