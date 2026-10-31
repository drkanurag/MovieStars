'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrendingTitlesForCountry, getUpcomingTitles, getBestOfAllTime } from '@/lib/api/movieStore';
import { TitleItem } from '@/types/movie';
import { MovieImage } from '@/components/MovieImage';
import { TrailerModal } from '@/components/TrailerModal';
import {
  COUNTRIES,
  getCountryByCode,
  COUNTRY_STREAMING_PLATFORMS,
  STREAMING_PLATFORMS,
  CELEBRITIES_BORN_TODAY,
} from '@/lib/data/mockMovies';
import { getTmdbImageUrl, formatRuntime, cn } from '@/lib/utils';
import { toggleListStatus, getClientState, getSelectedCountry, setSelectedCountry } from '@/lib/storage';

export default function HomePage() {
  const [activeCountry, setActiveCountry] = useState('IN');
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [trailerMovie, setTrailerMovie] = useState<TitleItem | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveCountry(getSelectedCountry());
    setWatchlistIds(getClientState().watchlist);

    const updateHandler = () => {
      setWatchlistIds(getClientState().watchlist);
    };

    const countryHandler = () => {
      setActiveCountry(getSelectedCountry());
    };

    window.addEventListener('moviestars_state_updated', updateHandler);
    window.addEventListener('moviestars_country_updated', countryHandler);
    return () => {
      window.removeEventListener('moviestars_state_updated', updateHandler);
      window.removeEventListener('moviestars_country_updated', countryHandler);
    };
  }, []);

  const countryConfig = getCountryByCode(activeCountry);
  const trending = getTrendingTitlesForCountry(activeCountry);
  const upcoming = getUpcomingTitles();
  const topRated = getBestOfAllTime();
  const currentPlatforms = COUNTRY_STREAMING_PLATFORMS[activeCountry] || STREAMING_PLATFORMS;

  // Hero showcase titles
  const heroList = [trending[0], trending[1], trending[2], upcoming[0], trending[3]].filter(Boolean);

  const openTrailer = (m: TitleItem) => {
    setTrailerMovie(m);
    setTrailerOpen(true);
  };

  const handleToggleWatchlist = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    toggleListStatus(id, 'watchlist');
    setWatchlistIds(getClientState().watchlist);
  };

  // Auto-advance hero carousel unless hovered
  useEffect(() => {
    if (isHeroHovered || heroList.length <= 1) return;
    const timer = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroList.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroList.length, isHeroHovered]);

  const heroMovie = heroList[activeHeroIndex] || trending[0];

  // Items for the "Up Next" rail (the other items in the hero list)
  const upNextList = heroList
    .map((item, idx) => ({ item, index: idx }))
    .filter((entry) => entry.index !== activeHeroIndex)
    .slice(0, 3);

  // Helper for Days-To-Go / Status
  const getDaysToGo = (dateStr?: string) => {
    if (!dateStr) return { text: 'Announced', isFuture: false };
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diff > 0) {
      return { text: `${diff} days to go`, isFuture: true };
    }
    return { text: 'Now in Theaters / Released', isFuture: false };
  };

  const heroStatus = getDaysToGo(heroMovie?.releaseDate);
  const heroScore = (
    heroMovie?.ratings?.bayesianScore ||
    heroMovie?.ratings?.imdb?.score ||
    heroMovie?.ratings?.tmdb?.score ||
    8.5
  ).toFixed(1);
  const heroMetascore = heroMovie?.ratings?.tmdb?.score
    ? Math.round(heroMovie.ratings.tmdb.score * 10)
    : 85;

  return (
    <div className="space-y-12">
      {/* ========================================== */}
      {/* 3. HERO SPOTLIGHT CAROUSEL & AMBIENT GLOW  */}
      {/* ========================================== */}
      <section
        className="relative rounded-xl overflow-hidden border border-surface-border bg-surface-card shadow-2xl"
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
      >
        {/* Ambient Violet & Gold Radial Background Flares */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-electric-violet/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-amber-gold/10 rounded-full blur-3xl pointer-events-none" />

        {/* Backdrop Poster Artwork with Gradient Embedding */}
        <div className="relative w-full min-h-[580px] lg:min-h-[640px] flex flex-col justify-end">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroMovie.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 w-full h-full"
            >
              <MovieImage
                src={getTmdbImageUrl(heroMovie.backdropPath || heroMovie.posterPath, 'w1280')}
                alt={heroMovie.title}
                fill
                priority
                className="object-cover opacity-35"
              />
              {/* Double-pass Vignette & Dark Embedding Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-surface-card/75 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-card via-surface-card/65 to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Spotlight Content Grid */}
          <div className="relative z-10 p-6 md:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            {/* Left Column: Spotlight Title, Badges, Plot & Triggers */}
            <div className="lg:col-span-8 space-y-4">
              {/* Format & Metadata Header HUD */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="bg-amber-gold text-surface-void font-bold px-2 py-0.5 rounded text-[11px] font-label-sm tracking-wider uppercase flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-xs"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  FEATURED
                </span>
                <span className="border border-cyber-cyan/30 text-cyber-cyan px-2 py-0.5 rounded text-[11px] font-label-sm tracking-wider uppercase font-semibold">
                  {heroMovie.type === 'web_series' || heroMovie.type === 'tv' ? 'TV SERIES' : 'MOVIE'}
                </span>
                <span className="text-text-muted text-xs font-semibold">
                  • {heroMovie.releaseDate?.slice(0, 4)} •
                </span>
                {heroMovie.runtimeMinutes && (
                  <span className="text-text-secondary text-xs font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                    {formatRuntime(heroMovie.runtimeMinutes)}
                  </span>
                )}
                <span className="border border-surface-border bg-surface-elevated/80 text-text-secondary px-2 py-0.5 rounded text-[10px] font-mono">
                  {heroMovie.technicalSpecs?.soundMix ? 'DOLBY ATMOS' : 'IMAX 70MM'}
                </span>
              </div>

              {/* Monumental Theatrical Title */}
              <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero tracking-wider text-text-primary uppercase drop-shadow-md leading-none">
                {heroMovie.title}
              </h1>

              {/* Tagline */}
              {heroMovie.tagline && (
                <p className="font-body-lg text-body-lg text-amber-gold/90 italic font-medium">
                  &ldquo;{heroMovie.tagline}&rdquo;
                </p>
              )}

              {/* Synopsis Plot HUD */}
              <p className="font-body-md text-body-md text-text-secondary max-w-2xl leading-relaxed line-clamp-3">
                {heroMovie.overview}
              </p>

              {/* Rating & Stats Bar */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {/* Bayesian Score Pill */}
                <div className="flex items-center gap-2 bg-surface-elevated/90 border border-amber-gold/30 px-3 py-1.5 rounded">
                  <span
                    className="material-symbols-outlined text-amber-gold text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span className="font-headline-sm text-headline-sm text-text-primary leading-none">
                    {heroScore}
                  </span>
                  <span className="font-caption text-caption text-text-muted">/10 (Bayesian)</span>
                </div>

                {/* Metascore Pill */}
                <div className="flex items-center gap-1.5 bg-surface-elevated/90 border border-surface-border px-3 py-1.5 rounded">
                  <span className="bg-metascore-green text-surface-void font-bold text-xs px-1.5 py-0.5 rounded font-label-sm">
                    {heroMetascore}
                  </span>
                  <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">
                    Metascore
                  </span>
                </div>

                {/* Live Countdown Chip */}
                <div className="flex items-center gap-1.5 bg-electric-violet/15 border border-electric-violet/30 px-3 py-1.5 rounded text-electric-violet text-xs font-semibold">
                  <span className="material-symbols-outlined text-sm">
                    {heroStatus.isFuture ? 'hourglass_top' : 'check_circle'}
                  </span>
                  <span>{heroStatus.text}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => openTrailer(heroMovie)}
                  className="bg-amber-gold hover:bg-amber-hover text-surface-void font-bold px-6 py-3 rounded flex items-center gap-2 transition-all duration-200 active:scale-95 glow-gold cursor-pointer"
                >
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    play_arrow
                  </span>
                  <span className="font-label-md text-label-md">Watch Trailer</span>
                </button>

                <Link
                  href={`/title/${heroMovie.id}`}
                  className="bg-surface-elevated/80 hover:bg-surface-elevated text-text-primary border border-surface-border px-5 py-3 rounded flex items-center gap-2 transition-all"
                >
                  <span className="material-symbols-outlined text-lg text-cyber-cyan">live_tv</span>
                  <span className="font-label-md text-label-md">Where to Watch</span>
                </Link>

                <button
                  type="button"
                  onClick={(e) => handleToggleWatchlist(heroMovie.id, e)}
                  className={cn(
                    'px-4 py-3 rounded flex items-center gap-1.5 transition-all border',
                    watchlistIds.includes(heroMovie.id)
                      ? 'bg-amber-gold/15 text-amber-gold border-amber-gold/40'
                      : 'bg-surface-elevated/80 hover:border-amber-gold/40 border-surface-border text-text-primary'
                  )}
                >
                  <span
                    className="material-symbols-outlined text-amber-gold text-lg"
                    style={watchlistIds.includes(heroMovie.id) ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {watchlistIds.includes(heroMovie.id) ? 'bookmark_added' : 'bookmark_add'}
                  </span>
                  <span className="font-label-md text-label-md">
                    {watchlistIds.includes(heroMovie.id) ? 'Saved' : '+ Want to Watch'}
                  </span>
                </button>
              </div>
            </div>

            {/* Right Column: "Up Next" Interactive Preview Rail */}
            <div className="lg:col-span-4 w-full">
              <div className="glass-card rounded-lg p-4 border border-surface-border/80 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-surface-border">
                  <span className="font-headline-sm text-headline-sm text-text-primary tracking-wide flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-amber-gold text-lg">
                      queue_play_next
                    </span>
                    Up next
                  </span>
                  <span className="text-[11px] font-label-sm text-text-muted">Click to preview</span>
                </div>

                {/* Up Next Rail Items */}
                <div className="space-y-2">
                  {upNextList.map(({ item, index }) => (
                    <div
                      key={item.id}
                      onClick={() => setActiveHeroIndex(index)}
                      className="group flex items-start gap-3 p-2 rounded hover:bg-surface-elevated/70 border border-transparent hover:border-surface-border transition-all cursor-pointer"
                    >
                      <div className="relative w-16 h-20 shrink-0 rounded overflow-hidden bg-surface-elevated">
                        <MovieImage
                          src={getTmdbImageUrl(item.posterPath, 'w185')}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-surface-void/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openTrailer(item);
                            }}
                            className="text-amber-gold hover:scale-110 transition-transform"
                            title="Play Trailer"
                          >
                            <span className="material-symbols-outlined text-xl">play_circle</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-amber-gold font-bold tracking-wider uppercase">
                          Watch Trailer
                        </span>
                        <h4 className="font-headline-sm text-headline-sm text-text-primary group-hover:text-amber-gold truncate transition-colors">
                          {item.title}
                        </h4>
                        <p className="font-caption text-caption text-text-muted line-clamp-1">
                          {item.overview}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-text-secondary font-medium">
                          <span className="text-amber-gold font-bold">
                            ★ {(item.ratings.imdb?.score || item.ratings.tmdb?.score || item.ratings.bayesianScore).toFixed(1)}
                          </span>
                          <span>• {item.releaseDate?.slice(0, 4)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  className="block text-center pt-2 text-xs font-semibold text-text-secondary hover:text-amber-gold transition-colors border-t border-surface-border flex items-center justify-center gap-1"
                  href="/browse"
                >
                  <span>Browse trailers &amp; titles</span>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 4. TOP 10 ON MOVIESTARS THIS WEEK           */}
      {/* ========================================== */}
      <section className="space-y-4">
        <div className="flex items-end justify-between border-l-4 border-amber-gold pl-3">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-amber-gold">
              Weekly Leaderboard
            </span>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-text-primary leading-none">
              Top 10 on MovieStars this week
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              className="text-xs font-semibold text-amber-gold hover:underline flex items-center gap-1"
              href="/top-rated"
            >
              <span>View Top 250</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>

            {/* Scroll Buttons for rail */}
            <div className="hidden sm:flex items-center gap-1.5 pl-2">
              <button
                type="button"
                onClick={() => railRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
                className="w-8 h-8 rounded bg-surface-card border border-surface-border text-text-secondary hover:text-amber-gold hover:border-amber-gold flex items-center justify-center transition-all cursor-pointer"
                aria-label="Scroll left"
              >
                <span className="material-symbols-outlined text-base">west</span>
              </button>
              <button
                type="button"
                onClick={() => railRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
                className="w-8 h-8 rounded bg-surface-card border border-surface-border text-text-secondary hover:text-amber-gold hover:border-amber-gold flex items-center justify-center transition-all cursor-pointer"
                aria-label="Scroll right"
              >
                <span className="material-symbols-outlined text-base">east</span>
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scrollable Container with Bento Rail */}
        <div
          ref={railRef}
          className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory scrollbar-none"
          id="top10-rail"
        >
          {trending.slice(0, 10).map((m, idx) => {
            const status = getDaysToGo(m.releaseDate);
            const score = (m.ratings.imdb?.score || m.ratings.tmdb?.score || m.ratings.bayesianScore).toFixed(1);

            return (
              <div
                key={m.id}
                className="w-64 md:w-72 shrink-0 snap-start bg-surface-card border border-surface-border rounded-lg overflow-hidden flex flex-col group hover:border-electric-violet transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-elevated">
                  <MovieImage
                    src={getTmdbImageUrl(m.posterPath, 'w500')}
                    alt={m.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent" />

                  {/* Huge Rank Watermark */}
                  <div className="absolute top-2 left-2 flex items-center justify-center w-9 h-9 bg-amber-gold text-surface-void font-headline-md text-headline-md rounded shadow-md">
                    {idx + 1}
                  </div>

                  {/* Star Rating Top Right */}
                  <div className="absolute top-2 right-2 bg-surface-void/80 backdrop-blur border border-amber-gold/30 px-2 py-0.5 rounded text-amber-gold text-xs font-bold flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-xs"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span>{score}</span>
                  </div>

                  {/* Countdown ribbon bottom */}
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] font-semibold text-cyber-cyan bg-surface-void/90 px-2 py-1 rounded border border-cyber-cyan/30">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
                      <span>{status.text}</span>
                    </span>
                    <span className="text-text-muted">{m.releaseDate?.slice(0, 4)}</span>
                  </div>
                </div>

                <div className="p-3.5 flex flex-col flex-1 justify-between space-y-2.5">
                  <div>
                    <div className="text-[10px] font-label-sm text-text-muted uppercase tracking-wider">
                      {m.type === 'web_series' || m.type === 'tv' ? 'TV' : 'Movie'} •{' '}
                      {m.originalLanguage?.toUpperCase()}
                    </div>
                    <Link href={`/title/${m.id}`}>
                      <h3 className="font-headline-sm text-headline-sm text-text-primary group-hover:text-amber-gold transition-colors truncate">
                        {m.title}
                      </h3>
                    </Link>
                    <p className="font-caption text-caption text-text-secondary line-clamp-2 mt-1">
                      {m.overview}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-surface-border flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => openTrailer(m)}
                      className="text-xs font-bold text-amber-gold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">play_circle</span>
                      <span>Watch Trailer</span>
                    </button>
                    <span className="text-[10px] text-text-muted font-mono">
                      {m.status === 'upcoming' ? 'Theatrical' : 'Streaming'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================== */}
      {/* 5. EXPLORE WHAT'S STREAMING (PROVIDER HUB) */}
      {/* ========================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-l-4 border-cyber-cyan pl-3 gap-2">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-cyber-cyan">
              Live Indexing
            </span>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-text-primary leading-none">
              Explore What&apos;s Streaming
            </h2>
            <p className="font-body-sm text-body-sm text-text-secondary">
              Verified streaming catalogs for {countryConfig.name} (powered by JustWatch)
            </p>
          </div>

          <Link
            className="text-xs font-semibold text-cyber-cyan hover:underline flex items-center gap-1"
            href={`/browse?country=${activeCountry}`}
          >
            <span>All Providers</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </Link>
        </div>

        {/* Bento Provider Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {currentPlatforms.map((plat) => {
            // Stylized acronym & accent
            const acronym = plat.name.slice(0, 2).toUpperCase();
            const isNetflix = plat.name.toLowerCase().includes('netflix');
            const isPrime = plat.name.toLowerCase().includes('prime') || plat.name.toLowerCase().includes('amazon');
            const isDisney = plat.name.toLowerCase().includes('disney') || plat.name.toLowerCase().includes('hotstar');
            const isJio = plat.name.toLowerCase().includes('jio');
            const isApple = plat.name.toLowerCase().includes('apple');

            return (
              <Link
                key={plat.id}
                href={`/browse?country=${activeCountry}&platform=${encodeURIComponent(plat.name)}`}
                className="group bg-surface-card hover:bg-surface-elevated border border-surface-border hover:border-cyber-cyan/50 p-4 rounded-lg flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1"
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform shadow-lg border',
                    isNetflix && 'bg-black border-surface-border text-red-600',
                    isPrime && 'bg-[#00A8E1]/20 border-[#00A8E1]/40 text-[#00A8E1]',
                    isDisney && 'bg-blue-950/40 border-blue-500/40 text-blue-400',
                    isJio && 'bg-pink-950/40 border-pink-500/40 text-pink-400',
                    isApple && 'bg-zinc-800 border-zinc-600 text-white',
                    !isNetflix && !isPrime && !isDisney && !isJio && !isApple && 'bg-purple-950/40 border-purple-500/40 text-purple-400'
                  )}
                >
                  {acronym}
                </div>
                <span className="mt-2.5 font-label-md text-label-md text-text-primary group-hover:text-cyber-cyan transition-colors truncate max-w-full">
                  {plat.name}
                </span>
                <span className="text-[10px] font-caption text-text-muted">
                  Catalog • 4.2k+
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ========================================== */}
      {/* 6. BORN TODAY / CELEBRITY SPOTLIGHT        */}
      {/* ========================================== */}
      <section className="space-y-4">
        <div className="border-l-4 border-electric-violet pl-3">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-electric-violet">
            Industry Spotlight
          </span>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-text-primary leading-none">
            Born Today / Celebrity Spotlight
          </h2>
          <p className="font-body-sm text-body-sm text-text-secondary">
            People in cinema celebrating birthdays today
          </p>
        </div>

        {/* Spotlight Circular Avatars Hub */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {CELEBRITIES_BORN_TODAY.map((celeb) => (
            <Link
              key={celeb.id}
              href={`/browse?q=${encodeURIComponent(celeb.name)}`}
              className="group bg-surface-card border border-surface-border hover:border-electric-violet p-4 rounded-xl flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-surface-border group-hover:border-electric-violet transition-colors">
                <MovieImage
                  src={celeb.profilePath}
                  alt={celeb.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute bottom-0 inset-x-0 bg-surface-void/80 text-[10px] py-0.5 text-amber-gold font-bold">
                  {celeb.age} yrs
                </div>
              </div>
              <h4 className="mt-3 font-headline-sm text-headline-sm text-text-primary group-hover:text-electric-violet transition-colors">
                {celeb.name}
              </h4>
              <span className="text-xs text-text-secondary font-medium">{celeb.role}</span>
              <span className="mt-1 text-[10px] text-text-muted truncate max-w-full">
                {celeb.topTitles?.[0] || celeb.knownFor}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================== */}
      {/* 7. UPCOMING RELEASES & LIVE COUNTDOWNS     */}
      {/* ========================================== */}
      <section className="space-y-4">
        <div className="flex items-end justify-between border-l-4 border-amber-gold pl-3">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-amber-gold">
              Countdowns
            </span>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-text-primary leading-none">
              Upcoming Releases &amp; Live Countdowns
            </h2>
            <p className="font-body-sm text-body-sm text-text-secondary">
              Trailers, countdown timers, and release alerts
            </p>
          </div>

          <Link
            className="text-xs font-semibold text-amber-gold hover:underline flex items-center gap-1"
            href="/upcoming"
          >
            <span>See All Upcoming</span>
            <span className="material-symbols-outlined text-sm">east</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcoming.slice(0, 3).map((m) => {
            const status = getDaysToGo(m.releaseDate);
            const score = (m.ratings.imdb?.score || m.ratings.tmdb?.score || m.ratings.bayesianScore).toFixed(1);

            return (
              <div
                key={m.id}
                className="bg-surface-card border border-surface-border rounded-lg overflow-hidden flex flex-col group hover:border-amber-gold/50 transition-all duration-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-elevated">
                  <MovieImage
                    src={getTmdbImageUrl(m.backdropPath || m.posterPath, 'w780')}
                    alt={m.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-card to-transparent" />

                  <div className="absolute top-3 right-3 bg-surface-void/85 border border-amber-gold/40 px-2 py-0.5 rounded text-amber-gold text-xs font-bold flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-xs"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span>{score}</span>
                  </div>

                  <div
                    className={cn(
                      'absolute bottom-3 left-3 font-bold text-[10px] px-2 py-0.5 rounded uppercase font-label-sm',
                      status.isFuture
                        ? 'bg-electric-violet/90 text-white'
                        : 'bg-metascore-green/90 text-surface-void'
                    )}
                  >
                    {status.text}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[11px] font-label-sm text-text-muted uppercase tracking-wider">
                      {m.type === 'web_series' || m.type === 'tv' ? 'TV' : 'Movie'} •{' '}
                      {m.originalLanguage?.toUpperCase()} • {m.releaseDate?.slice(0, 4)}
                    </div>
                    <Link href={`/title/${m.id}`}>
                      <h3 className="font-headline-sm text-headline-sm text-text-primary group-hover:text-amber-gold transition-colors">
                        {m.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-cyber-cyan font-medium">
                      {m.genres?.map((g) => g.name).join(', ') || 'Cinema'}
                    </p>
                    <p className="font-caption text-caption text-text-secondary mt-2 line-clamp-2">
                      {m.overview}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => openTrailer(m)}
                      className="bg-surface-elevated hover:bg-amber-gold hover:text-surface-void text-text-primary px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">play_arrow</span>
                      <span>Watch Trailer</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleToggleWatchlist(m.id, e)}
                      className={cn(
                        'text-xs font-semibold flex items-center gap-1 transition-colors',
                        watchlistIds.includes(m.id)
                          ? 'text-amber-gold'
                          : 'text-text-secondary hover:text-text-primary'
                      )}
                    >
                      <span
                        className="material-symbols-outlined text-sm"
                        style={watchlistIds.includes(m.id) ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        {watchlistIds.includes(m.id) ? 'bookmark_added' : 'bookmark_add'}
                      </span>
                      <span>{watchlistIds.includes(m.id) ? 'Saved' : 'Watchlist'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================= */}
      {/* 8. IMDB TOP 250 & BAYESIAN BEST OF ALL TIME (RANK TABLE) */}
      {/* ======================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-l-4 border-amber-gold pl-3 gap-2">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-amber-gold">
              Historical Hall of Fame
            </span>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-text-primary leading-none">
              IMDb Top 250 &amp; Bayesian Best of All Time
            </h2>
            <p className="font-body-sm text-body-sm text-text-secondary">
              Mathematically weighted Top 250 eliminating low vote count bias
            </p>
          </div>

          <Link
            className="text-xs font-semibold text-amber-gold hover:underline flex items-center gap-1"
            href="/top-rated"
          >
            <span>View Full Chart</span>
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </Link>
        </div>

        {/* High Density Leaderboard Rows */}
        <div className="space-y-3">
          {topRated.slice(0, 10).map((m, idx) => {
            const score = (m.ratings.imdb?.score || m.ratings.tmdb?.score || m.ratings.bayesianScore).toFixed(1);
            const metascore = m.ratings.tmdb?.score ? Math.round(m.ratings.tmdb.score * 10) : 88;

            return (
              <div
                key={m.id}
                className="bg-surface-card hover:bg-surface-elevated border border-surface-border hover:border-amber-gold/40 p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-200"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Oversized Bebas Neue Rank */}
                  <div
                    className={cn(
                      'font-headline-md text-headline-md w-10 text-center shrink-0',
                      idx === 0 ? 'text-amber-gold' : 'text-text-muted hover:text-electric-violet'
                    )}
                  >
                    #{idx + 1}
                  </div>

                  {/* Poster Thumbnail */}
                  <div className="w-12 h-16 rounded overflow-hidden shrink-0 bg-surface-elevated relative">
                    <MovieImage
                      src={getTmdbImageUrl(m.posterPath, 'w185')}
                      alt={m.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/title/${m.id}`}>
                        <h3 className="font-headline-sm text-headline-sm text-text-primary hover:text-amber-gold transition-colors truncate">
                          {m.title}
                        </h3>
                      </Link>
                      <span className="text-[10px] text-text-muted font-label-sm uppercase">
                        • {m.type === 'web_series' || m.type === 'tv' ? 'TV Series' : 'Movie'} •{' '}
                        {m.originalLanguage?.toUpperCase()} • {m.releaseDate?.slice(0, 4)}
                      </span>
                    </div>

                    <p className="font-caption text-caption text-text-secondary line-clamp-1 max-w-xl">
                      {m.overview}
                    </p>

                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[10px] text-text-muted">Origin:</span>
                      <span className="text-[10px] font-semibold text-amber-gold bg-surface-void px-1.5 py-0.2 rounded border border-surface-border">
                        {m.originCountry || 'Global'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metascore & Bayesian Weight Scores */}
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-surface-border shrink-0">
                  <span className="bg-metascore-green text-surface-void font-bold text-xs px-2 py-0.5 rounded">
                    {metascore}
                  </span>

                  <div className="flex items-center gap-1.5 text-amber-gold font-bold">
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="text-lg">{score}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openTrailer(m)}
                    className="text-xs bg-surface-void hover:bg-amber-gold hover:text-surface-void px-3 py-1.5 rounded border border-surface-border text-text-secondary hover:text-surface-void transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                    <span>Trailer</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Global Real YouTube Trailer Modal */}
      {trailerMovie && (
        <TrailerModal
          isOpen={trailerOpen}
          onClose={() => setTrailerOpen(false)}
          title={trailerMovie.title}
          year={trailerMovie.releaseDate?.slice(0, 4)}
          youtubeKey={trailerMovie.trailerYoutubeKey}
        />
      )}
    </div>
  );
}
