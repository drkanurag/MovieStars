'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrendingTitles, getUpcomingTitles, getBestOfAllTime } from '@/lib/api/movieStore';
import { MovieCard } from '@/components/MovieCard';
import { RatingBadge } from '@/components/RatingBadge';
import { TrailerModal } from '@/components/TrailerModal';
import { STREAMING_PLATFORMS, CELEBRITIES_BORN_TODAY } from '@/lib/data/mockMovies';
import {
  Sparkles,
  TrendingUp,
  Trophy,
  ArrowRight,
  Play,
  Info,
  Flame,
  Star,
  Bookmark,
  Calendar,
  Clock,
  ChevronRight,
  Tv,
  Plus,
  Check,
} from 'lucide-react';
import { getTmdbImageUrl, formatRuntime, cn } from '@/lib/utils';
import { staggerContainer, fadeInUp, heroSlide } from '@/lib/animations';
import { toggleListStatus, getClientState } from '@/lib/storage';

export default function HomePage() {
  const trending = getTrendingTitles();
  const upcoming = getUpcomingTitles();
  const topRated = getBestOfAllTime();

  // Hero showcase titles
  const heroList = [trending[0], trending[1], trending[2], upcoming[0], trending[3]].filter(Boolean);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);

  useEffect(() => {
    setWatchlistIds(getClientState().watchlist);
    const updateHandler = () => {
      setWatchlistIds(getClientState().watchlist);
    };
    window.addEventListener('moviestars_state_updated', updateHandler);
    return () => window.removeEventListener('moviestars_state_updated', updateHandler);
  }, []);

  // Auto-advance hero carousel unless hovered
  useEffect(() => {
    if (isHeroHovered) return;
    const timer = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroList.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroList.length, isHeroHovered]);

  const heroMovie = heroList[activeHeroIndex] || trending[0];

  // Items for the "Up Next" queue (the next 3 items)
  const upNextIndices = [
    (activeHeroIndex + 1) % heroList.length,
    (activeHeroIndex + 2) % heroList.length,
    (activeHeroIndex + 3) % heroList.length,
  ];

  return (
    <div className="space-y-14">
      {/* 1. IMDb-Style Split Hero Showcase: Main Video Stage + "Up Next" Queue */}
      <section
        className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch"
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
      >
        {/* Main Stage (8 cols) */}
        <div className="lg:col-span-8 relative rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl flex flex-col justify-end min-h-[460px] sm:min-h-[520px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroMovie.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={getTmdbImageUrl(heroMovie.backdropPath, 'original')}
                alt={heroMovie.title}
                fill
                priority
                className="object-cover opacity-40 transition-transform duration-1000 ease-out group-hover:scale-105"
              />
              {/* Cinematic Vignette Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/80 to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Center Play Trailer Button */}
          {heroMovie.trailerYoutubeKey && (
            <div className="absolute inset-0 m-auto w-20 h-20 flex items-center justify-center z-10 pointer-events-none">
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTrailerOpen(true)}
                className="pointer-events-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#f5c518] hover:bg-white text-black flex items-center justify-center shadow-2xl shadow-amber-500/40 transition-all cursor-pointer"
                title="Watch Official Trailer"
              >
                <Play className="w-8 h-8 fill-current ml-1" />
              </motion.button>
            </div>
          )}

          {/* Hero Content Overlay: Poster + Info */}
          <div className="relative z-20 p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-end sm:items-center">
            {/* Poster Thumbnail */}
            <div className="relative w-24 sm:w-32 aspect-[2/3] rounded-2xl overflow-hidden shrink-0 border-2 border-white/20 shadow-2xl bg-zinc-900 hidden sm:block">
              <Image
                src={getTmdbImageUrl(heroMovie.posterPath, 'w500')}
                alt={heroMovie.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Title & Metadata Details */}
            <div className="space-y-2 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#f5c518] text-black font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-current" />
                  Featured
                </span>
                <span className="text-zinc-300 text-xs font-bold uppercase tracking-wider">
                  {heroMovie.type === 'web_series' ? 'Web Series' : heroMovie.type} •{' '}
                  {heroMovie.releaseDate?.slice(0, 4)}
                </span>
                {heroMovie.runtimeMinutes && (
                  <span className="text-zinc-400 text-xs font-medium">
                    • {formatRuntime(heroMovie.runtimeMinutes)}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {heroMovie.title}
              </h1>

              {heroMovie.tagline && (
                <p className="text-zinc-300 text-xs sm:text-sm italic font-serif line-clamp-1">
                  &ldquo;{heroMovie.tagline}&rdquo;
                </p>
              )}

              <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                {heroMovie.overview}
              </p>

              {/* Rating Cluster & Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 border border-white/15 text-white font-extrabold text-xs">
                  <Star className="w-4 h-4 fill-[#f5c518] text-[#f5c518]" />
                  <span>{heroMovie.ratings.imdb.score.toFixed(1)}</span>
                  <span className="text-zinc-500 font-normal">/10</span>
                </div>

                {heroMovie.metascore && (
                  <div
                    className="px-2 py-1 rounded text-xs font-black text-white bg-emerald-600 shadow-md"
                    title={`Metascore: ${heroMovie.metascore}/100`}
                  >
                    {heroMovie.metascore} Metascore
                  </div>
                )}

                <Link
                  href={`/title/${heroMovie.id}`}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/10"
                >
                  <Info className="w-3.5 h-3.5 text-[#f5c518]" />
                  <span>Where to Watch</span>
                </Link>

                {/* Save to Watchlist / Want to Watch Button */}
                <button
                  onClick={() => toggleListStatus(heroMovie.id, 'watchlist', heroMovie.title)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer shadow-md active:scale-95',
                    watchlistIds.includes(heroMovie.id)
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      : 'bg-[#f5c518] hover:bg-amber-400 text-black shadow-amber-500/30'
                  )}
                >
                  {watchlistIds.includes(heroMovie.id) ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Saved in Watchlist</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>+ Want to Watch</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: "Up Next" Queue (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-[#1a1a1a] border border-white/10 p-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-black uppercase tracking-widest text-[#f5c518] flex items-center gap-1.5">
                <span>Up next</span>
              </span>
              <span className="text-[11px] text-zinc-400 font-medium">Click to preview</span>
            </div>

            {/* List of 3 Up Next Items */}
            <div className="space-y-3">
              {upNextIndices.map((idx) => {
                const nextMovie = heroList[idx];
                if (!nextMovie) return null;

                return (
                  <button
                    key={nextMovie.id}
                    onClick={() => setActiveHeroIndex(idx)}
                    className="w-full flex items-center gap-3.5 p-2.5 rounded-2xl bg-zinc-900/60 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left group"
                  >
                    {/* Thumbnail with small play badge */}
                    <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10">
                      <Image
                        src={getTmdbImageUrl(nextMovie.posterPath, 'w185')}
                        alt={nextMovie.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 fill-[#f5c518] text-[#f5c518]" />
                      </div>
                    </div>

                    {/* Movie Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold uppercase mb-0.5">
                        <Play className="w-2.5 h-2.5 fill-current text-[#f5c518]" />
                        <span>Watch Trailer</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-white truncate group-hover:text-[#f5c518] transition-colors">
                        {nextMovie.title}
                      </h4>
                      <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                        {nextMovie.overview}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-400">
                        <span className="flex items-center gap-1 text-[#f5c518] font-bold">
                          <Star className="w-3 h-3 fill-current" />
                          {nextMovie.ratings.imdb.score.toFixed(1)}
                        </span>
                        <span>•</span>
                        <span>{nextMovie.releaseDate?.slice(0, 4)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Browse All Trailers Link */}
          <Link
            href="/browse"
            className="mt-4 flex items-center justify-between text-xs font-bold text-[#f5c518] hover:text-amber-300 pt-3 border-t border-white/10 transition-colors"
          >
            <span>Browse trailers & titles</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 2. Top 10 on MovieStars this Week (IMDb / Netflix Top 10 Styling) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 rounded-full bg-[#f5c518]" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Top 10 on MovieStars this week
            </h2>
          </div>
          <Link
            href="/top-rated"
            className="text-xs font-bold text-[#f5c518] hover:text-amber-300 flex items-center gap-1"
          >
            <span>View Top 250</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Horizontal Scroll Shelf */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {trending.slice(0, 10).map((movie, index) => {
            const rank = index + 1;
            return (
              <div key={movie.id} className="relative group">
                {/* Giant Stylized Rank Number Overlay */}
                <span className="absolute -left-3 bottom-14 z-20 font-black text-6xl sm:text-7xl text-zinc-800/80 group-hover:text-[#f5c518]/90 transition-colors select-none pointer-events-none drop-shadow-md">
                  {rank}
                </span>
                <div className="relative z-10 pl-4">
                  <MovieCard movie={movie} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Explore What's Streaming in India 🇮🇳 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 rounded-full bg-[#f5c518]" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Explore What&apos;s Streaming
              </h2>
              <p className="text-xs text-zinc-400">
                Verified streaming catalogs for India (powered by JustWatch)
              </p>
            </div>
          </div>
          <Link
            href="/browse"
            className="text-xs font-bold text-[#f5c518] hover:text-amber-300 flex items-center gap-1"
          >
            <span>All Providers</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Platform Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {STREAMING_PLATFORMS.map((platform) => (
            <motion.div
              key={platform.id}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={`/browse?provider=${encodeURIComponent(platform.name)}`}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#1a1a1a] hover:bg-zinc-800 border border-white/10 hover:border-[#f5c518]/60 transition-all group shadow-md"
              >
                <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center font-black text-xs text-[#f5c518] border border-white/10 shrink-0">
                  {platform.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-white truncate group-hover:text-[#f5c518] transition-colors">
                    {platform.name}
                  </div>
                  <div className="text-[10px] text-zinc-400">Catalog</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Born Today / Celebrity Spotlight (IMDb Iconic Feature) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 rounded-full bg-[#f5c518]" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Born Today / Celebrity Spotlight
              </h2>
              <p className="text-xs text-zinc-400">
                People in cinema celebrating birthdays today
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {CELEBRITIES_BORN_TODAY.map((celeb) => (
            <Link
              key={celeb.id}
              href={`/person/${celeb.id}`}
              className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#1a1a1a] hover:bg-zinc-800 border border-white/10 hover:border-[#f5c518]/60 transition-all group shadow-md"
            >
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-[#f5c518] transition-colors shadow-lg bg-zinc-900 mb-3">
                <Image
                  src={celeb.profilePath}
                  alt={celeb.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-white group-hover:text-[#f5c518] transition-colors line-clamp-1">
                {celeb.name}
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">{celeb.age} years old</p>
              <p className="text-[10px] text-zinc-500 line-clamp-1 mt-1 font-medium">
                {celeb.role}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Upcoming Releases with Live Radar Countdowns */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 rounded-full bg-[#f5c518]" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Upcoming Releases & Live Countdowns
              </h2>
              <p className="text-xs text-zinc-400">
                Trailers, countdown timers, and release alerts
              </p>
            </div>
          </div>
          <Link
            href="/upcoming"
            className="text-xs font-bold text-[#f5c518] hover:text-amber-300 flex items-center gap-1"
          >
            <span>See All Upcoming</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {upcoming.slice(0, 4).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* 6. Best of All Time (Bayesian Top 250 Preview) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 rounded-full bg-[#f5c518]" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                IMDb Top 250 & Bayesian Best of All Time
              </h2>
              <p className="text-xs text-zinc-400">
                Mathematically weighted Top 250 eliminating low vote count bias
              </p>
            </div>
          </div>
          <Link
            href="/top-rated"
            className="text-xs font-bold text-[#f5c518] hover:text-amber-300 flex items-center gap-1"
          >
            <span>View Full Chart</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {topRated.slice(0, 4).map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} rank={index + 1} />
          ))}
        </div>
      </section>

      {/* Trailer Modal */}
      {heroMovie.trailerYoutubeKey && (
        <TrailerModal
          youtubeKey={heroMovie.trailerYoutubeKey}
          title={heroMovie.title}
          isOpen={trailerOpen}
          onClose={() => setTrailerOpen(false)}
        />
      )}
    </div>
  );
}
