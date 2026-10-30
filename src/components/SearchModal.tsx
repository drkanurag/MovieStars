'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { MovieImage } from './MovieImage';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Star,
  Film,
  Tv,
  Clapperboard,
  ArrowRight,
  Sparkles,
  Trophy,
  Bookmark,
  Compass,
  Check,
  Plus,
  Play,
} from 'lucide-react';
import { TrailerModal } from './TrailerModal';
import { searchCatalogAutocomplete } from '@/lib/api/movieStore';
import { TitleItem } from '@/types/movie';
import { scoreToStars } from '@/lib/bayesian';
import { getTmdbImageUrl, cn } from '@/lib/utils';
import { modalBackdrop, modalScale } from '@/lib/animations';
import { toggleListStatus, getClientState } from '@/lib/storage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TitleItem[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [trailerMovie, setTrailerMovie] = useState<TitleItem | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setWatchlistIds(getClientState().watchlist);
    const handleUpdate = () => setWatchlistIds(getClientState().watchlist);
    window.addEventListener('moviestars_state_updated', handleUpdate);
    return () => window.removeEventListener('moviestars_state_updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const matches = searchCatalogAutocomplete(query, 6);
    setResults(matches);
  }, [query]);

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  const handleFullSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/browse?q=${encodeURIComponent(query)}`);
  };

  const quickNavLinks = [
    { label: 'Browse All Catalog', href: '/browse', icon: Film, desc: 'Filter by genre, year & streaming platforms' },
    { label: 'Upcoming Countdowns', href: '/upcoming', icon: Sparkles, desc: 'Release dates, trailers & reminders' },
    { label: 'Top 250 Best of All Time', href: '/top-rated', icon: Trophy, desc: 'Bayesian weighted leaderboard' },
    { label: 'My Cinema Library', href: '/watchlist', icon: Bookmark, desc: 'Watchlists, favorites & watched' },
    { label: 'Worldwide Catalog Search', href: '/search', icon: Compass, desc: 'Search 11.2M+ global movies and web series' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-14 sm:pt-20 bg-black/85 backdrop-blur-xl"
        >
          <motion.div
            variants={modalScale}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl glass-panel-elevated border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Search Input Bar */}
            <form onSubmit={handleFullSearch} className="relative flex items-center border-b border-white/10 bg-cinema-elevated/90 px-5 py-4">
              <Search className="w-5 h-5 text-cinema-accent mr-3.5 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to search movies, series, actors or navigate..."
                className="w-full bg-transparent text-white placeholder-zinc-500 text-sm sm:text-base font-semibold outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-full text-zinc-400 hover:text-white mr-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="px-2 py-1 text-[10px] font-mono rounded-lg bg-black/60 border border-white/15 text-zinc-400">
                ESC
              </kbd>
            </form>

            {/* Results or Quick Navigation Directory */}
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-white/[0.06] p-3">
              {/* When no query is typed: Show Instant Quick Nav Command Center */}
              {!query.trim() && (
                <div className="space-y-4 p-2">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 px-1">
                    <Compass className="w-4 h-4 text-cinema-gold" />
                    <span>Quick Navigation Directory</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {quickNavLinks.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelect(item.href)}
                          className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/10 cursor-pointer transition-all group border border-transparent hover:border-white/10"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-white/10 group-hover:bg-cinema-gold group-hover:text-black transition-colors text-zinc-300">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white group-hover:text-cinema-gold transition-colors">
                                {item.label}
                              </div>
                              <div className="text-[11px] text-zinc-400">{item.desc}</div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-cinema-gold group-hover:translate-x-1 transition-all" />
                        </div>
                      );
                    })}
                  </div>

                  {/* Popular Genre Quick Filters */}
                  <div className="pt-2 border-t border-white/[0.08]">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 px-1">
                      Quick Genre Filters:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Action', 'Sci-Fi', 'Crime', 'Drama', 'Adventure', 'History'].map((genre) => (
                        <button
                          key={genre}
                          onClick={() => handleSelect(`/browse?genre=${encodeURIComponent(genre)}`)}
                          className="px-2.5 py-1 rounded-xl glass-pill hover:bg-white/10 text-[11px] font-semibold text-zinc-300 hover:text-white"
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* When user types a query */}
              {query.trim() && results.length === 0 && (
                <div className="py-12 text-center text-zinc-400 text-xs">
                  No direct matches found for &quot;{query}&quot;. Press Enter to explore all catalog metadata.
                </div>
              )}

              {results.map((item, index) => {
                const stars = scoreToStars(item.ratings.bayesianScore);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => handleSelect(`/title/${item.id}`)}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/10 cursor-pointer transition-all group"
                  >
                    <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-white/10 group-hover:scale-105 transition-transform">
                      <MovieImage
                        src={getTmdbImageUrl(item.posterPath, 'w300')}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white group-hover:text-cinema-gold text-sm truncate transition-colors">
                          {item.title}
                        </span>
                        <span className="text-xs text-zinc-400 font-semibold">
                          ({item.releaseDate ? item.releaseDate.slice(0, 4) : 'TBA'})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                        <span className="flex items-center gap-1 text-cinema-accent font-bold capitalize">
                          {item.type === 'movie' && <Film className="w-3 h-3" />}
                          {item.type === 'tv' && <Tv className="w-3 h-3" />}
                          {item.type === 'web_series' && <Clapperboard className="w-3 h-3" />}
                          {item.type.replace('_', ' ')}
                        </span>
                        <span>•</span>
                        <span className="truncate">{item.genres.map((g) => g.name).slice(0, 2).join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl glass-pill border border-amber-400/30 text-cinema-gold text-xs font-black">
                        <Star className="w-3.5 h-3.5 fill-cinema-gold drop-shadow-[0_0_6px_rgba(245,197,24,0.6)]" />
                        <span>{stars.toFixed(1)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTrailerMovie(item);
                          setTrailerOpen(true);
                        }}
                        className="p-1.5 rounded-xl bg-white/10 hover:bg-[#f5c518] text-zinc-300 hover:text-black transition-all cursor-pointer"
                        title={`Watch ${item.title} Trailer`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleListStatus(item.id, 'watchlist', item.title);
                        }}
                        className={cn(
                          'p-1.5 rounded-xl transition-all cursor-pointer',
                          watchlistIds.includes(item.id)
                            ? 'bg-[#f5c518] text-black shadow-md'
                            : 'bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white'
                        )}
                        title={
                          watchlistIds.includes(item.id)
                            ? 'Saved in Watchlist (Click to remove)'
                            : 'Save to Watchlist (Want to Watch)'
                        }
                      >
                        {watchlistIds.includes(item.id) ? (
                          <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer with Enter action */}
            {query.trim() && (
              <div className="p-3.5 bg-cinema-elevated/80 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
                <span>Press Enter to search all metadata</span>
                <button
                  onClick={handleFullSearch}
                  className="flex items-center gap-1.5 text-cinema-gold hover:text-cinema-goldLight font-bold"
                >
                  <span>View all results</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Trailer Modal (Finds trailer dynamically from YouTube if needed) */}
      {trailerMovie && (
        <TrailerModal
          youtubeKey={trailerMovie.trailerYoutubeKey}
          title={trailerMovie.title}
          year={trailerMovie.releaseDate?.slice(0, 4)}
          isOpen={trailerOpen}
          onClose={() => setTrailerOpen(false)}
        />
      )}
    </AnimatePresence>
  );
}
