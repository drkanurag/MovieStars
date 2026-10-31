'use client';

import React, { Suspense, useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { filterAndSortTitles } from '@/lib/api/movieStore';
import {
  ALL_GENRES,
  COUNTRIES,
  COUNTRY_STREAMING_PLATFORMS,
  STREAMING_PLATFORMS,
  getCountryByCode,
} from '@/lib/data/mockMovies';
import { MovieCard } from '@/components/MovieCard';
import { FilterOptions, TitleType, TitleItem } from '@/types/movie';
import {
  Filter,
  SlidersHorizontal,
  RefreshCcw,
  Film,
  Tv,
  Clapperboard,
  Star,
  LayoutGrid,
  List,
  Sparkles,
  Globe,
  X,
  Search,
} from 'lucide-react';
import { getSelectedCountry, setSelectedCountry } from '@/lib/storage';
import { cn } from '@/lib/utils';

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [type, setType] = useState<'all' | TitleType>(
    (searchParams.get('type') as any) || 'all'
  );
  const [genre, setGenre] = useState<string>(searchParams.get('genre') || 'all');
  const [language, setLanguage] = useState<string>(searchParams.get('lang') || 'all');
  const [year, setYear] = useState<string>(searchParams.get('year') || 'all');
  const [ratingMin, setRatingMin] = useState<number>(0);
  const [provider, setProvider] = useState<string>(searchParams.get('provider') || 'all');
  const [country, setCountry] = useState<string>('IN');
  const [originCountry, setOriginCountry] = useState<string>(searchParams.get('origin') || 'all');
  const [sortBy, setSortBy] = useState<FilterOptions['sortBy']>(
    (searchParams.get('sortBy') as any) || 'bayesian'
  );
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [worldwideResults, setWorldwideResults] = useState<TitleItem[]>([]);
  const [isSearchingWorldwide, setIsSearchingWorldwide] = useState<boolean>(false);

  useEffect(() => {
    document.title = 'Explore Movies & TV Series — Country-Wise Cinema & Streaming | MovieStars';
    const cParam = searchParams.get('country');
    if (cParam) {
      setCountry(cParam);
      setSelectedCountry(cParam);
    } else {
      setCountry(getSelectedCountry());
    }

    const oParam = searchParams.get('origin');
    if (oParam) setOriginCountry(oParam);

    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
    const prov = searchParams.get('provider');
    if (prov) setProvider(prov);
    const genreParam = searchParams.get('genre');
    if (genreParam) setGenre(genreParam);
    const typeParam = searchParams.get('type');
    if (typeParam) setType(typeParam as any);

    // Initial background sync
    fetch('/api/sync').catch(() => {});
  }, [searchParams]);

  // Worldwide live federation effect when searching
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setWorldwideResults([]);
      setIsSearchingWorldwide(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearchingWorldwide(true);
      fetch(`/api/worldwide/search?q=${encodeURIComponent(q)}&type=${type}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.results)) {
            setWorldwideResults(data.results);
          }
        })
        .catch((e) => console.warn('Worldwide browse search error:', e))
        .finally(() => setIsSearchingWorldwide(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, type]);

  const filterOptions: Partial<FilterOptions> = useMemo(
    () => ({
      type,
      genre,
      language,
      year,
      ratingMin,
      provider,
      country,
      originCountry,
      sortBy,
      searchQuery,
    }),
    [type, genre, language, year, ratingMin, provider, country, originCountry, sortBy, searchQuery]
  );

  const { items, total } = useMemo(() => {
    return filterAndSortTitles(filterOptions);
  }, [filterOptions]);

  const displayItems = useMemo(() => {
    if (searchQuery.trim().length > 1 && worldwideResults.length > 0) {
      const existingIds = new Set(items.map((i) => i.id));

      const filteredWorldwide = worldwideResults.filter((w) => {
        if (existingIds.has(w.id)) return false;

        if (type !== 'all' && w.type !== type) return false;

        if (genre !== 'all') {
          const hasGenre = w.genres?.some((g) => g.name.toLowerCase() === genre.toLowerCase());
          if (!hasGenre) return false;
        }

        if (language !== 'all' && w.originalLanguage.toLowerCase() !== language.toLowerCase()) {
          return false;
        }

        if (year !== 'all' && !w.releaseDate?.startsWith(year)) {
          return false;
        }

        if (ratingMin > 0) {
          const score = w.ratings.bayesianScore || w.ratings.imdb?.score || w.ratings.tmdb?.score || 0;
          if (score < ratingMin) return false;
        }

        if (provider !== 'all') {
          const regionAvail = w.availability[country] || w.availability['IN'];
          if (!regionAvail) return false;
          const allOffers = [...regionAvail.stream, ...regionAvail.rent, ...regionAvail.buy];
          const hasProvider = allOffers.some((o) =>
            o.provider.name.toLowerCase().includes(provider.toLowerCase())
          );
          if (!hasProvider) return false;
        }

        if (originCountry !== 'all' && w.originCountry && w.originCountry !== originCountry) return false;

        return true;
      });

      return [...items, ...filteredWorldwide];
    }
    return items;
  }, [items, searchQuery, worldwideResults, type, genre, language, year, ratingMin, provider, country, originCountry]);

  const handleReset = () => {
    setType('all');
    setGenre('all');
    setLanguage('all');
    setYear('all');
    setRatingMin(0);
    setProvider('all');
    setOriginCountry('all');
    setSortBy('bayesian');
    setSearchQuery('');
  };

  const handleCountryPillClick = (code: string) => {
    if (code === 'all') {
      setOriginCountry('all');
    } else {
      setOriginCountry(code);
      setCountry(code);
      setSelectedCountry(code);
      setProvider('all');
    }
  };

  const selectedCountryConfig = originCountry !== 'all' ? getCountryByCode(originCountry) : null;
  const currentRegionConfig = getCountryByCode(country);

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-surface-border pb-6">
        <div className="border-l-4 border-amber-gold pl-3">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-amber-gold">
            Discovery Catalog
          </span>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-text-primary leading-none">
            Explore Cinema &amp; Series
          </h1>
          <p className="font-body-sm text-body-sm text-text-secondary mt-1">
            Browse unified titles with Bayesian star ratings, country-based origin filtering, and streaming availability across 180+ territories.
          </p>
        </div>

        {/* Search input in browse */}
        <div className="w-full md:w-80">
          <div className="relative">
            <span className="material-symbols-outlined text-text-muted text-lg absolute left-3.5 top-1/2 -translate-y-1/2">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search titles, actors, directors..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-card border border-surface-border text-xs sm:text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold shadow-lg font-body-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Country-Wise Cinema Filter Hub (Shifted from Home) */}
      <section className="bg-surface-card border border-surface-border rounded-xl p-4 sm:p-5 shadow-2xl space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-gold/15 border border-amber-gold/30 text-amber-gold flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg">public</span>
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2">
                <span>Filter by Country of Origin &amp; Heritage</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-gold text-surface-void uppercase font-label-sm">
                  12 Cinema Regions
                </span>
              </h2>
              <p className="text-[11px] text-text-muted">
                Select a cinema territory to isolate regional masterpieces, local blockbusters, and localized streaming catalogs
              </p>
            </div>
          </div>

          {originCountry !== 'all' && (
            <button
              type="button"
              onClick={() => handleCountryPillClick('all')}
              className="text-xs text-amber-gold hover:underline flex items-center gap-1 font-semibold self-start sm:self-auto"
            >
              <span>Show All Global Cinema</span>
              <span className="material-symbols-outlined text-xs">close</span>
            </button>
          )}
        </div>

        {/* 12-Country Selector Pill Track */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* All Global Option */}
          <button
            type="button"
            onClick={() => handleCountryPillClick('all')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap shrink-0 border',
              originCountry === 'all'
                ? 'bg-amber-gold text-surface-void border-amber-gold glow-gold scale-105'
                : 'bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-surface-border border-surface-border'
            )}
          >
            <span>🌐</span>
            <span className="font-label-sm">All World Cinema</span>
          </button>

          {/* 12 Specific Countries */}
          {COUNTRIES.map((c) => {
            const isSelected = originCountry === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => handleCountryPillClick(c.code)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap shrink-0 border',
                  isSelected
                    ? 'bg-amber-gold text-surface-void border-amber-gold glow-gold scale-105'
                    : 'bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-surface-border border-surface-border'
                )}
                title={`${c.name} (${c.region})`}
              >
                <span>{c.flag}</span>
                <span className="font-label-sm">{c.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({c.code})</span>
              </button>
            );
          })}
        </div>

        {/* Active Country Detail Ribbon */}
        {selectedCountryConfig && (
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-surface-border text-xs text-text-secondary">
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedCountryConfig.flag}</span>
              <span className="font-bold text-text-primary">{selectedCountryConfig.name} Cinema:</span>
              <span className="italic text-text-muted">&ldquo;{selectedCountryConfig.tagline}&rdquo;</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-text-muted">
              <span>Region: {selectedCountryConfig.region}</span>
              <span>•</span>
              <span>Currency: {selectedCountryConfig.currency}</span>
            </div>
          </div>
        )}
      </section>

      {/* 3. Control Bar: Type Selector & View Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-card p-3.5 rounded-xl border border-surface-border shadow-xl">
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
                'px-4 py-2 rounded text-xs font-bold transition-all shrink-0',
                type === item.id
                  ? 'bg-amber-gold text-surface-void glow-gold shadow-md font-label-md'
                  : 'bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-surface-border border border-surface-border'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* View Mode & Sort Dropdown */}
        <div className="flex items-center gap-3 text-xs">
          {/* Grid vs List Toggles */}
          <div className="hidden sm:flex items-center bg-surface-elevated p-1 rounded border border-surface-border">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewMode === 'grid' ? 'bg-amber-gold text-surface-void font-bold' : 'text-text-secondary hover:text-text-primary'
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewMode === 'list' ? 'bg-amber-gold text-surface-void font-bold' : 'text-text-secondary hover:text-text-primary'
              )}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-text-secondary font-semibold">
            <SlidersHorizontal className="w-4 h-4 text-cyber-cyan" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-surface-elevated text-text-primary border border-surface-border rounded px-3 py-2 outline-none font-bold cursor-pointer hover:border-amber-gold/50 transition-colors"
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

      {/* 4. Advanced Filter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 bg-surface-card p-4 rounded-xl border border-surface-border text-xs shadow-lg">
        {/* Origin Country Filter Dropdown */}
        <div>
          <label className="block text-text-secondary font-bold mb-1.5 flex items-center justify-between">
            <span>Origin Country</span>
            <span className="text-[10px] text-amber-gold font-bold">Heritage</span>
          </label>
          <select
            value={originCountry}
            onChange={(e) => setOriginCountry(e.target.value)}
            className="w-full bg-surface-elevated border border-surface-border text-text-primary rounded p-2.5 outline-none font-semibold cursor-pointer hover:border-amber-gold/50 transition-colors"
          >
            <option value="all">All Origins (Global)</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        {/* Watch Region (Where to Stream) */}
        <div>
          <label className="block text-text-secondary font-bold mb-1.5 flex items-center justify-between">
            <span>Watch Region</span>
            <span className="text-[10px] text-cyber-cyan font-bold">Stream</span>
          </label>
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setSelectedCountry(e.target.value);
              setProvider('all');
            }}
            className="w-full bg-surface-elevated border border-surface-border text-text-primary rounded p-2.5 outline-none font-semibold cursor-pointer hover:border-cyber-cyan/50 transition-colors"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Streaming Platform (Dynamic based on Selected Watch Region) */}
        <div>
          <label className="block text-text-secondary font-bold mb-1.5">Platform</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full bg-surface-elevated border border-surface-border text-text-primary rounded p-2.5 outline-none font-semibold cursor-pointer hover:border-amber-gold/50 transition-colors"
          >
            <option value="all">Any Platform ({country})</option>
            {(COUNTRY_STREAMING_PLATFORMS[country] || STREAMING_PLATFORMS).map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Genre */}
        <div>
          <label className="block text-text-secondary font-bold mb-1.5">Genre</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full bg-surface-elevated border border-surface-border text-text-primary rounded p-2.5 outline-none font-semibold cursor-pointer hover:border-amber-gold/50 transition-colors"
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
          <label className="block text-text-secondary font-bold mb-1.5">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-surface-elevated border border-surface-border text-text-primary rounded p-2.5 outline-none font-semibold cursor-pointer hover:border-amber-gold/50 transition-colors"
          >
            <option value="all">All Languages</option>
            <option value="en">English (Hollywood/UK)</option>
            <option value="hi">Hindi (Bollywood)</option>
            <option value="te">Telugu (Tollywood)</option>
            <option value="ta">Tamil (Kollywood)</option>
            <option value="ml">Malayalam (Mollywood)</option>
            <option value="ko">Korean (K-Drama)</option>
            <option value="ja">Japanese (Anime &amp; Cinema)</option>
            <option value="es">Spanish (Español)</option>
            <option value="fr">French (Français)</option>
            <option value="de">German (Deutsch)</option>
            <option value="pt">Portuguese (Português)</option>
            <option value="it">Italian (Italiano)</option>
          </select>
        </div>

        {/* Minimum Rating */}
        <div>
          <label className="block text-text-secondary font-bold mb-1.5">Minimum Stars</label>
          <select
            value={ratingMin}
            onChange={(e) => setRatingMin(Number(e.target.value))}
            className="w-full bg-surface-elevated border border-surface-border text-text-primary rounded p-2.5 outline-none font-semibold cursor-pointer hover:border-amber-gold/50 transition-colors"
          >
            <option value={0}>All Ratings</option>
            <option value={4.0}>★ 4.0+ Stars (Top Rated)</option>
            <option value={4.5}>★ 4.5+ Stars (Masterpieces)</option>
          </select>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded bg-surface-elevated hover:bg-amber-gold hover:text-surface-void text-text-primary font-bold transition-all border border-surface-border cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 5. Results Counter & Active Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary font-semibold">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-text-primary">{displayItems.length}</strong> {displayItems.length === 1 ? 'title' : 'titles'}
          </span>
          {originCountry !== 'all' && (
            <span className="flex items-center gap-1 bg-amber-gold/15 text-amber-gold px-2 py-0.5 rounded font-mono text-[11px] border border-amber-gold/30">
              Origin: {selectedCountryConfig?.flag} {selectedCountryConfig?.name}
              <button
                type="button"
                onClick={() => setOriginCountry('all')}
                className="hover:text-white ml-0.5"
              >
                ✕
              </button>
            </span>
          )}
          {provider !== 'all' && (
            <span className="flex items-center gap-1 bg-cyber-cyan/15 text-cyber-cyan px-2 py-0.5 rounded font-mono text-[11px] border border-cyber-cyan/30">
              Platform: {provider}
              <button
                type="button"
                onClick={() => setProvider('all')}
                className="hover:text-white ml-0.5"
              >
                ✕
              </button>
            </span>
          )}
          {genre !== 'all' && (
            <span className="flex items-center gap-1 bg-surface-elevated text-text-primary px-2 py-0.5 rounded font-mono text-[11px] border border-surface-border">
              Genre: {genre}
              <button
                type="button"
                onClick={() => setGenre('all')}
                className="hover:text-white ml-0.5"
              >
                ✕
              </button>
            </span>
          )}
          {isSearchingWorldwide && (
            <span className="text-[11px] text-amber-gold flex items-center gap-1 animate-pulse">
              • Searching 11.2M+ global cinema database...
            </span>
          )}
        </div>
        {sortBy === 'bayesian' && (
          <span className="flex items-center gap-1.5 text-amber-gold">
            <Sparkles className="w-3.5 h-3.5" />
            Sorted by Bayesian Weighted Rating
          </span>
        )}
      </div>

      {/* 6. Grid / List View */}
      {displayItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayItems.map((movie, idx) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              rank={sortBy === 'bayesian' ? idx + 1 : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface-card rounded-xl border border-surface-border space-y-3">
          <Film className="w-14 h-14 text-text-muted mx-auto" />
          <h3 className="text-lg font-bold text-text-primary">No local titles match your filter criteria</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Try resetting your country or genre filters, or search across the complete worldwide catalog of 11.2M+ titles on our global search engine.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-surface-elevated hover:bg-surface-border text-text-primary rounded text-xs font-bold transition-colors border border-surface-border"
            >
              Reset Filters
            </button>
            {searchQuery && (
              <a
                href={`/search?q=${encodeURIComponent(searchQuery)}`}
                className="px-5 py-2 bg-amber-gold hover:bg-amber-hover text-surface-void rounded text-xs font-bold glow-gold transition-colors"
              >
                Search Global Database ↗
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-text-muted">Loading catalog...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
