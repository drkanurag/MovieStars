'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MovieImage } from './MovieImage';
import { motion } from 'framer-motion';
import { TitleItem } from '@/types/movie';
import { Star, Bookmark, Play, Heart, CheckCircle2, Plus, Check } from 'lucide-react';
import { scoreToStars } from '@/lib/bayesian';
import { getCountryByCode } from '@/lib/data/mockMovies';
import { getDaysUntil, getTmdbImageUrl, formatReleaseYear } from '@/lib/utils';
import { getClientState, toggleListStatus, getSelectedCountry } from '@/lib/storage';
import { TrailerModal } from './TrailerModal';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  movie: TitleItem;
  rank?: number;
  className?: string;
  showTrendingNumber?: boolean;
}

export function MovieCard({ movie, rank, className, showTrendingNumber }: MovieCardProps) {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [inFavorites, setInFavorites] = useState(false);
  const [inWatched, setInWatched] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [activeCountry, setActiveCountry] = useState('IN');

  const bayesianStars = scoreToStars(movie.ratings.bayesianScore);
  const isUpcoming = movie.status === 'upcoming';
  const countdown = isUpcoming ? getDaysUntil(movie.releaseDate) : null;

  useEffect(() => {
    const s = getClientState();
    setInWatchlist(s.watchlist.includes(movie.id));
    setInFavorites(s.favorites.includes(movie.id));
    setInWatched(s.watched.includes(movie.id));
    setActiveCountry(getSelectedCountry());

    const updateHandler = () => {
      const state = getClientState();
      setInWatchlist(state.watchlist.includes(movie.id));
      setInFavorites(state.favorites.includes(movie.id));
      setInWatched(state.watched.includes(movie.id));
      setActiveCountry(getSelectedCountry());
    };

    window.addEventListener('moviestars_state_updated', updateHandler);
    window.addEventListener('moviestars_country_updated', updateHandler);
    return () => {
      window.removeEventListener('moviestars_state_updated', updateHandler);
      window.removeEventListener('moviestars_country_updated', updateHandler);
    };
  }, [movie.id]);

  const handleAction = (
    e: React.MouseEvent,
    type: 'watchlist' | 'favorites' | 'watched'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const active = toggleListStatus(movie.id, type, movie.title);
    if (type === 'watchlist') setInWatchlist(active);
    if (type === 'favorites') setInFavorites(active);
    if (type === 'watched') setInWatched(active);
  };

  const currentRegion = movie.availability[activeCountry] || movie.availability['IN'];
  const streamingOffers = currentRegion?.stream || [];

  return (
    <>
      <motion.div
        whileHover={{ y: -8, scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className={cn(
          'group relative flex flex-col rounded-2xl overflow-hidden glass-panel border border-cinema-border/60 hover:border-cinema-gold/70 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer',
          className
        )}
      >
        {/* Poster Container */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
          <Link href={`/title/${movie.id}`}>
            <MovieImage
              src={getTmdbImageUrl(movie.posterPath, 'w500')}
              alt={movie.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
            />
          </Link>

          {/* Vignette Gradients */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-cinema-card via-cinema-card/75 to-transparent pointer-events-none" />

          {/* Open-Source Metallic Sheen Reflection Sweep on Hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-10" />

          {/* IMDb-Style Bookmark Ribbon on Top-Left */}
          <button
            onClick={(e) => handleAction(e, 'watchlist')}
            className="absolute top-0 left-2.5 z-20 group/ribbon focus:outline-none"
            title={inWatchlist ? 'In Watchlist (Click to remove)' : 'Add to Watchlist'}
          >
            <div
              className={cn(
                'relative w-7 h-9 flex items-center justify-center transition-all duration-300 drop-shadow-md',
                inWatchlist
                  ? 'text-[#f5c518] scale-105'
                  : 'text-black/65 hover:text-black/85'
              )}
            >
              <svg viewBox="0 0 32 42" className="w-full h-full fill-current">
                <path d="M0 0h32v42l-16-10-16 10V0z" />
              </svg>
              <div className="absolute top-1.5 inset-x-0 flex items-center justify-center">
                {inWatchlist ? (
                  <Check className="w-3.5 h-3.5 text-black stroke-[3.5]" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-white stroke-[2.5] group-hover/ribbon:scale-125 transition-transform" />
                )}
              </div>
            </div>
          </button>

          {/* Rank Badge for Top-Rated Leaderboards */}
          {rank !== undefined && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={cn(
                'absolute top-2.5 left-12 z-10 flex items-center justify-center w-7 h-7 rounded-xl font-black text-xs shadow-lg backdrop-blur-md',
                rank === 1
                  ? 'bg-gradient-to-br from-amber-300 via-cinema-gold to-amber-600 text-black shadow-amber-500/40'
                  : rank === 2
                  ? 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-black shadow-white/20'
                  : rank === 3
                  ? 'bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 text-amber-200 shadow-amber-800/40'
                  : 'bg-black/70 border border-white/20 text-white'
              )}
            >
              #{rank}
            </motion.div>
          )}

          {/* Rating Badge Top-Right */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-md text-[#f5c518] font-black text-xs shadow-md border border-white/10">
            <Star className="w-3.5 h-3.5 fill-[#f5c518] text-[#f5c518]" />
            <span>{(movie.ratings?.imdb?.score ?? 7.5).toFixed(1)}</span>
          </div>

          {/* Metascore Chip if available */}
          {movie.metascore && (
            <div
              className={cn(
                'absolute bottom-2.5 left-2.5 z-10 px-1.5 py-0.5 rounded text-[10px] font-black tracking-tight text-white shadow-md',
                movie.metascore >= 80
                  ? 'bg-emerald-600'
                  : movie.metascore >= 60
                  ? 'bg-amber-600'
                  : 'bg-red-600'
              )}
              title={`Metascore: ${movie.metascore}/100`}
            >
              {movie.metascore}
            </div>
          )}

          {/* Central Play Trailer Button */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setTrailerOpen(true);
            }}
            className="absolute inset-0 m-auto z-10 w-12 h-12 rounded-full bg-[#f5c518]/95 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl shadow-amber-500/30 hover:bg-white cursor-pointer"
            title={`Watch ${movie.title} Trailer`}
            aria-label={`Watch ${movie.title} Trailer`}
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </motion.button>

          {/* Quick Action Floating Dock (Favorites & Watched) */}
          <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 glass-pill p-1 rounded-xl shadow-xl">
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.85 }}
              onClick={(e) => handleAction(e, 'favorites')}
              className={cn(
                'p-1.5 rounded-lg hover:bg-white/10 transition-colors',
                inFavorites ? 'text-cinema-red' : 'text-zinc-400 hover:text-white'
              )}
              title={inFavorites ? 'Favorited' : 'Favorite'}
            >
              <Heart className={cn('w-3.5 h-3.5', inFavorites && 'fill-current')} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.85 }}
              onClick={(e) => handleAction(e, 'watched')}
              className={cn(
                'p-1.5 rounded-lg hover:bg-white/10 transition-colors',
                inWatched ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'
              )}
              title={inWatched ? 'Watched' : 'Mark as Watched'}
            >
              <CheckCircle2 className={cn('w-3.5 h-3.5', inWatched && 'fill-current')} />
            </motion.button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-3.5 justify-between bg-gradient-to-b from-cinema-card to-cinema-card/90">
          <div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 uppercase tracking-wider font-semibold mb-1">
              <span className="text-cinema-accent font-bold">
                {movie.type === 'web_series' ? 'Web Series' : movie.type === 'tv' ? 'TV Series' : 'Movie'}
              </span>
              <span className="text-zinc-500">•</span>
              {movie.originCountry && (
                <>
                  <span className="inline-flex items-center gap-1 font-bold text-zinc-300">
                    <span>{getCountryByCode(movie.originCountry).flag}</span>
                    <span>{movie.originCountry}</span>
                  </span>
                  <span className="text-zinc-500">•</span>
                </>
              )}
              <span>{(movie.originalLanguage || 'en').toUpperCase()}</span>
              <span className="text-zinc-500">•</span>
              <span>{formatReleaseYear(movie.releaseDate)}</span>
            </div>

            <Link href={`/title/${movie.id}`}>
              <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-cinema-gold transition-colors line-clamp-1">
                {movie.title}
              </h3>
            </Link>

            <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5 font-medium">
              {(movie.genres || []).map((g) => g.name).join(', ') || 'Global Cinema'}
            </p>

            {/* Summary / What It's About */}
            <p className="text-[11px] text-zinc-300/90 line-clamp-2 mt-1.5 leading-relaxed font-normal">
              {movie.overview}
            </p>

            {/* Quick Trailer Watch Trigger */}
            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTrailerOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 hover:text-[#f5c518] transition-colors py-0.5 group/btn"
                title={`Play ${movie.title} Trailer`}
              >
                <span className="w-4 h-4 rounded-full bg-[#f5c518]/20 group-hover/btn:bg-[#f5c518] text-[#f5c518] group-hover/btn:text-black flex items-center justify-center transition-colors">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </span>
                <span>Watch Trailer</span>
              </button>
            </div>
          </div>

          {/* Bottom Streaming Providers or Countdown */}
          <div className="mt-2.5 pt-2 border-t border-cinema-border/50">
            {isUpcoming && countdown ? (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cinema-gold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cinema-gold"></span>
                </span>
                <span className="truncate">{countdown.text}</span>
              </div>
            ) : streamingOffers.length > 0 ? (
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider shrink-0">On:</span>
                <div className="flex items-center gap-1.5 truncate">
                  {streamingOffers.slice(0, 2).map((offer, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-cinema-elevated border border-cinema-border/80 text-[10px] font-semibold text-zinc-200 truncate"
                      title={offer.provider.name}
                    >
                      {offer.provider.name}
                    </span>
                  ))}
                  {streamingOffers.length > 2 && (
                    <span className="text-[10px] text-zinc-400 font-bold">
                      +{streamingOffers.length - 2}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-zinc-500 font-medium italic">In Theaters / VOD</div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Trailer Modal (Finds trailer dynamically if needed) */}
      <TrailerModal
        youtubeKey={movie.trailerYoutubeKey}
        title={movie.title}
        year={movie.releaseDate ? movie.releaseDate.slice(0, 4) : undefined}
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
      />
    </>
  );
}
