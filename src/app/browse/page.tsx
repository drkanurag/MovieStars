'use client';

import React, { Suspense, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { filterAndSortTitles } from '@/lib/api/movieStore';
import { ALL_GENRES, COUNTRIES, STREAMING_PLATFORMS } from '@/lib/data/mockMovies';
import { MovieCard } from '@/components/MovieCard';
import { FilterOptions, TitleType } from '@/types/movie';
import { Filter, SlidersHorizontal, RefreshCcw, Film, Tv, Clapperboard, Star, LayoutGrid, List, Sparkles } from 'lucide-react';
import { getSelectedCountry, setSelectedCountry } from '@/lib/storage';
import { cn } from '@/lib/utils';

function BrowseContent() {
  const searchParams = useSearchParams();

  const [type, setType] = useState<'all' | TitleType>(
    (searchParams.get('type') as any) || 'all'
  );
  const [genre, setGenre] = useState<string>(searchParams.get('genre') || 'all');
  const [language, setLanguage] = useState<string>(searchParams.get('lang') || 'all');
  const [year, setYear] = useState<string>(searchParams.get('year') || 'all');
  const [ratingMin, setRatingMin] = useState<number>(0);
  const [provider, setProvider] = useState<string>(searchParams.get('provider') || 'all');
  const [country, setCountry] = useState<string>('IN');
  const [sortBy, setSortBy] = useState<FilterOptions['sortBy']>(
    (searchParams.get('sortBy') as any) || 'bayesian'
  );
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    document.title = 'Explore Movies & TV Series — Streaming Availability Worldwide | MovieStars';
    setCountry(getSelectedCountry());
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
    const prov = searchParams.get('provider');
    if (prov) setProvider(prov);
  }, [searchParams]);

  const filterOptions: Partial<FilterOptions> = useMemo(
    () => ({
      type,
      genre,
      language,
      year,
      ratingMin,
      provider,
      country,
      sortBy,
      searchQuery,
    }),
    [type, genre, language, year, ratingMin, provider, country, sortBy, searchQuery]
  );

  const { items, total } = useMemo(() => {
    return filterAndSortTitles(filterOptions);
  }, [filterOptions]);

  const handleReset = () => {
    setType('all');
    setGenre('all');
    setLanguage('all');
    setYear('all');
    setRatingMin(0);
    setProvider('all');
    setSortBy('bayesian');
    setSearchQuery('');
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Film className="w-8 h-8 text-cinema-gold" />
            Explore Cinema <span className="gold-gradient-text">& Series</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Unified catalogue across streaming platforms, genres, and languages with Bayesian star ratings
          </p>
        </div>

        {/* Search input in browse */}
        <div className="w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles, actors, directors..."
            className="w-full px-4 py-2.5 rounded-2xl glass-panel border border-white/10 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none focus:border-cinema-gold shadow-lg"
          />
        </div>
      </div>

      {/* Control Bar: Type Selector & View Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel p-3.5 rounded-2xl border border-white/10 shadow-xl">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Titles' },
            { id: 'movie', label: 'Movies' },
            { id: 'tv', label: 'TV Shows' },
            { id: 'web_series', label: 'Web Series' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setType(item.id as any)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0',
                type === item.id
                  ? 'bg-cinema-gold text-black shadow-md shadow-amber-500/25'
                  : 'glass-pill text-zinc-400 hover:text-white'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* View Mode & Sort Dropdown */}
        <div className="flex items-center gap-3 text-xs">
          {/* Grid vs List Toggles */}
          <div className="hidden sm:flex items-center glass-pill p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white'
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewMode === 'list' ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white'
              )}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-zinc-400 font-semibold">
            <SlidersHorizontal className="w-4 h-4 text-cinema-accent" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-cinema-elevated text-zinc-200 border border-white/10 rounded-xl px-3 py-2 outline-none font-bold cursor-pointer"
            >
              <option value="bayesian">Bayesian Weighted Rating</option>
              <option value="popularity">Popularity / Trending</option>
              <option value="releaseDate">Release Date (Newest first)</option>
              <option value="votes">Total Vote Count</option>
              <option value="title">Alphabetical (A - Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Filter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 glass-panel p-4 rounded-2xl border border-white/10 text-xs shadow-lg">
        {/* Genre */}
        <div>
          <label className="block text-zinc-400 font-bold mb-1.5">Genre</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full bg-cinema-elevated border border-white/10 text-white rounded-xl p-2.5 outline-none font-semibold"
          >
            <option value="all">All Genres</option>
            {ALL_GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-zinc-400 font-bold mb-1.5">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-cinema-elevated border border-white/10 text-white rounded-xl p-2.5 outline-none font-semibold"
          >
            <option value="all">All Languages</option>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="te">Telugu</option>
            <option value="ta">Tamil</option>
            <option value="ko">Korean</option>
            <option value="ja">Japanese</option>
          </select>
        </div>

        {/* Platform */}
        <div>
          <label className="block text-zinc-400 font-bold mb-1.5">Platform</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full bg-cinema-elevated border border-white/10 text-white rounded-xl p-2.5 outline-none font-semibold"
          >
            <option value="all">Any Platform</option>
            {STREAMING_PLATFORMS.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Minimum Rating */}
        <div>
          <label className="block text-zinc-400 font-bold mb-1.5">Minimum Stars</label>
          <select
            value={ratingMin}
            onChange={(e) => setRatingMin(Number(e.target.value))}
            className="w-full bg-cinema-elevated border border-white/10 text-white rounded-xl p-2.5 outline-none font-semibold"
          >
            <option value={0}>All Ratings</option>
            <option value={4.0}>★ 4.0+ Stars (Top Rated)</option>
            <option value={4.5}>★ 4.5+ Stars (Masterpieces)</option>
          </select>
        </div>

        {/* Country Selector */}
        <div>
          <label className="block text-zinc-400 font-bold mb-1.5">Region</label>
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setSelectedCountry(e.target.value);
            }}
            className="w-full bg-cinema-elevated border border-white/10 text-white rounded-xl p-2.5 outline-none font-semibold"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl glass-pill hover:bg-white/10 text-zinc-200 font-bold transition-all"
          >
            <RefreshCcw className="w-3.5 h-3.5 text-cinema-accent" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold">
        <span>
          Showing <strong className="text-white">{items.length}</strong> {items.length === 1 ? 'title' : 'titles'}
        </span>
        {sortBy === 'bayesian' && (
          <span className="flex items-center gap-1.5 text-cinema-gold">
            <Sparkles className="w-3.5 h-3.5" />
            Sorted by Bayesian Weighted Rating
          </span>
        )}
      </div>

      {/* Grid View */}
      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((movie, idx) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              rank={sortBy === 'bayesian' ? idx + 1 : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-panel rounded-3xl border border-white/10">
          <Film className="w-14 h-14 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No titles match your filter criteria</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Try resetting your filters or changing the streaming platform.
          </p>
          <button
            onClick={handleReset}
            className="mt-4 px-5 py-2.5 bg-cinema-gold text-black rounded-xl text-xs font-black shadow-md"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-zinc-400">Loading catalog...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
