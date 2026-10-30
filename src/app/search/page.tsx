'use client';

import React, { Suspense, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { getCatalog } from '@/lib/api/movieStore';
import { TitleItem } from '@/types/movie';
import { MovieCard } from '@/components/MovieCard';
import {
  Search,
  X,
  Star,
  Film,
  Tv,
  Clapperboard,
  SlidersHorizontal,
  Bookmark,
  Check,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Filter,
} from 'lucide-react';
import { getTmdbImageUrl, formatRuntime } from '@/lib/utils';
import { scoreToStars } from '@/lib/bayesian';
import { getClientState, toggleListStatus } from '@/lib/storage';
import { cn } from '@/lib/utils';

const POPULAR_SEARCH_CHIPS = [
  'Oppenheimer',
  'Dune: Part Two',
  'The Godfather',
  'Breaking Bad',
  'Mirzapur',
  '12th Fail',
  'Interstellar',
  'RRR',
  'Christopher Nolan',
  'Cillian Murphy',
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<'all' | 'movie' | 'tv' | 'web_series'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    setWatchlistIds(getClientState().watchlist);
    const updateHandler = () => setWatchlistIds(getClientState().watchlist);
    window.addEventListener('moviestars_state_updated', updateHandler);
    return () => window.removeEventListener('moviestars_state_updated', updateHandler);
  }, []);

  const catalog = getCatalog();

  // Search and filter logic
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    return catalog.filter((movie) => {
      // 1. Text Search matching title, overview, cast, director, character
      if (q) {
        const titleMatch = movie.title.toLowerCase().includes(q);
        const originalTitleMatch = movie.originalTitle?.toLowerCase().includes(q);
        const overviewMatch = movie.overview.toLowerCase().includes(q);
        const castMatch = movie.cast.some(
          (c) => c.name.toLowerCase().includes(q) || c.character?.toLowerCase().includes(q)
        );
        const dirMatch = movie.directors.some((d) => d.name.toLowerCase().includes(q));
        const genreMatch = movie.genres.some((g) => g.name.toLowerCase().includes(q));

        if (!titleMatch && !originalTitleMatch && !overviewMatch && !castMatch && !dirMatch && !genreMatch) {
          return false;
        }
      }

      // 2. Type Filter
      if (selectedType !== 'all' && movie.type !== selectedType) {
        return false;
      }

      // 3. Genre Filter
      if (selectedGenre !== 'all' && !movie.genres.some((g) => g.name.toLowerCase() === selectedGenre.toLowerCase())) {
        return false;
      }

      // 4. Platform Filter
      if (selectedPlatform !== 'all') {
        const inRegion = movie.availability['IN'] || movie.availability['US'];
        const allOffers = [...(inRegion?.stream || []), ...(inRegion?.rent || []), ...(inRegion?.buy || [])];
        const hasPlatform = allOffers.some((o) =>
          o.provider.name.toLowerCase().includes(selectedPlatform.toLowerCase())
        );
        if (!hasPlatform) return false;
      }

      // 5. Min Rating
      if (minRating > 0 && movie.ratings.imdb.score < minRating) {
        return false;
      }

      return true;
    });
  }, [catalog, query, selectedType, selectedGenre, selectedPlatform, minRating]);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (text.trim()) {
      router.replace(`/search?q=${encodeURIComponent(text.trim())}`);
    } else {
      router.replace('/search');
    }
  };

  const handleChipClick = (chip: string) => {
    handleQueryChange(chip);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Header & Giant Search Hero Box */}
      <div className="text-center space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5c518]/20 border border-[#f5c518]/40 text-[#f5c518] text-xs font-black uppercase tracking-wider">
          <Search className="w-3.5 h-3.5" />
          <span>Cinema Intelligence Search</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Find Any <span className="text-[#f5c518]">Movie, TV Show</span> or Celebrity
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Search across thousands of titles, actors, directors, genres, and streaming catalogs with instant keystroke suggestions
        </p>

        {/* Live Search Input Box */}
        <div className="relative max-w-2xl mx-auto mt-6">
          <div className="relative flex items-center bg-[#1a1a1a] border-2 border-white/20 focus-within:border-[#f5c518] rounded-2xl p-2 sm:p-2.5 shadow-2xl transition-all">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-[#f5c518] ml-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search by title, actor, director, genre, or keyword..."
              autoFocus
              className="w-full bg-transparent text-white placeholder-zinc-500 text-sm sm:text-base font-semibold px-3 outline-none"
            />
            {query && (
              <button
                onClick={() => handleQueryChange('')}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white mr-1 transition-colors"
                title="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleQueryChange(query)}
              className="px-4 py-2 rounded-xl bg-[#f5c518] hover:bg-amber-400 text-black font-black text-xs transition-colors shrink-0 shadow-md"
            >
              Search
            </button>
          </div>
        </div>

        {/* Popular Trending Search Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 max-w-2xl mx-auto">
          <span className="text-[11px] font-bold text-zinc-500 mr-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[#f5c518]" />
            Trending:
          </span>
          {POPULAR_SEARCH_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className={cn(
                'px-2.5 py-1 rounded-xl text-xs font-semibold transition-all border',
                query.toLowerCase() === chip.toLowerCase()
                  ? 'bg-[#f5c518] text-black border-[#f5c518]'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border-white/10'
              )}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interactive Filter Strip */}
      <div className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        {/* Type Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Formats' },
            { id: 'movie', label: 'Movies' },
            { id: 'tv', label: 'TV Shows' },
            { id: 'web_series', label: 'Web Series' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id as any)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                selectedType === type.id
                  ? 'bg-[#f5c518] text-black shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Streaming Platform & Rating Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Platform selector */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-200 font-bold outline-none cursor-pointer"
          >
            <option value="all">All Streaming Platforms</option>
            <option value="Netflix">Netflix</option>
            <option value="Prime Video">Amazon Prime Video</option>
            <option value="Hotstar">Disney+ Hotstar</option>
            <option value="JioCinema">JioCinema</option>
            <option value="Apple TV">Apple TV</option>
            <option value="Zee5">Zee5</option>
          </select>

          {/* Min Rating selector */}
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-200 font-bold outline-none cursor-pointer"
          >
            <option value="0">Any Rating</option>
            <option value="8.0">★ 8.0+ High Rated</option>
            <option value="8.5">★ 8.5+ Masterpieces</option>
            <option value="9.0">★ 9.0+ All-Time Greats</option>
          </select>

          {(selectedType !== 'all' || selectedPlatform !== 'all' || minRating > 0 || query) && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedType('all');
                setSelectedPlatform('all');
                setMinRating(0);
                router.replace('/search');
              }}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 3. Search Results Count Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="text-sm font-bold text-white flex items-center gap-2">
          <span>Found</span>
          <span className="text-[#f5c518] font-black">{results.length}</span>
          <span>{results.length === 1 ? 'title' : 'titles'}</span>
          {query && (
            <span className="text-zinc-400 font-normal">
              for &ldquo;<strong className="text-white">{query}</strong>&rdquo;
            </span>
          )}
        </div>
        <span className="text-xs text-zinc-400">Sorted by relevance and Bayesian rating</span>
      </div>

      {/* 4. Results Grid or No Matches State */}
      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 p-8 rounded-3xl bg-[#1a1a1a] border border-white/10 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-[#f5c518]">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-white">
            No titles matched &ldquo;{query}&rdquo;
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            Try checking for spelling errors, searching by actor name (e.g., Cillian Murphy, Timothée Chalamet), or browsing our curated master catalog.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => handleQueryChange('')}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-bold text-xs transition-colors"
            >
              Clear Search
            </button>
            <Link
              href="/browse"
              className="px-4 py-2 rounded-xl bg-[#f5c518] hover:bg-amber-400 text-black font-black text-xs transition-colors shadow-md"
            >
              Browse Full Catalog
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#f5c518] border-t-transparent animate-spin mx-auto" />
          <p className="text-zinc-400 text-xs font-semibold">Loading search engine...</p>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
