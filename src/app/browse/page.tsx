'use client';

import React, { Suspense, useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { filterAndSortTitles, getCatalogCounts } from '@/lib/api/movieStore';
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { getSelectedCountry, setSelectedCountry } from '@/lib/storage';
import { cn } from '@/lib/utils';

const DEFAULT_ITEMS_PER_PAGE = 24;

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resultsGridRef = useRef<HTMLDivElement>(null);

  // Type: Default to 'movie' if none provided for separate distinct pages, or use query param
  const initialType = (searchParams.get('type') as any) || 'movie';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [type, setType] = useState<'all' | TitleType>(initialType);
  const [currentPage, setCurrentPage] = useState<number>(initialPage > 0 ? initialPage : 1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(DEFAULT_ITEMS_PER_PAGE);

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

  const counts = useMemo(() => getCatalogCounts(), []);

  // Sync params with URL state
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam) {
      setType(typeParam as any);
    }

    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    if (!isNaN(pageParam) && pageParam > 0) {
      setCurrentPage(pageParam);
    }

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

    // Initial background sync
    fetch('/api/sync').catch(() => {});
  }, [searchParams]);

  // Update dynamic document title based on selected page type
  useEffect(() => {
    let titlePrefix = 'Explore Movies';
    if (type === 'tv') titlePrefix = 'Explore TV Series';
    else if (type === 'web_series') titlePrefix = 'Explore Web Series';
    else if (type === 'all') titlePrefix = 'Explore Unified Catalog';

    document.title = `${titlePrefix} (Page ${currentPage}) — Country-Wise Cinema & Streaming | MovieStars`;
  }, [type, currentPage]);

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

  const { items } = useMemo(() => {
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

  // Pagination calculation
  const totalItems = displayItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Ensure current page does not exceed totalPages
  const activePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (activePage - 1) * itemsPerPage;
    return displayItems.slice(startIndex, startIndex + itemsPerPage);
  }, [displayItems, activePage, itemsPerPage]);

  const scrollToResults = () => {
    if (resultsGridRef.current) {
      resultsGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    scrollToResults();
  };

  const handleTypeChange = (newType: 'all' | TitleType) => {
    setType(newType);
    setCurrentPage(1);
    router.push(`/browse?type=${newType}`);
  };

  const handleReset = () => {
    setType('movie');
    setGenre('all');
    setLanguage('all');
    setYear('all');
    setRatingMin(0);
    setProvider('all');
    setOriginCountry('all');
    setSortBy('bayesian');
    setSearchQuery('');
    setCurrentPage(1);
    router.push('/browse?type=movie');
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
    setCurrentPage(1);
  };

  const selectedCountryConfig = originCountry !== 'all' ? getCountryByCode(originCountry) : null;
  const currentRegionConfig = getCountryByCode(country);

  // Category navigation tabs
  const categoryTabs = [
    {
      id: 'movie',
      label: 'Feature Films',
      name: 'Movies',
      icon: 'movie',
      count: counts.movies,
      badge: '270+ Movies',
      description: 'Cinema, blockbusters & award-winning films',
    },
    {
      id: 'tv',
      label: 'TV Series',
      name: 'TV Shows',
      icon: 'tv',
      count: counts.tv,
      badge: '600+ Series',
      description: 'Binge-worthy multi-season television & anime',
    },
    {
      id: 'web_series',
      label: 'Web Series',
      name: 'Web Series',
      icon: 'play_circle',
      count: counts.webSeries,
      badge: '35+ Originals',
      description: 'Streaming originals & limited miniseries',
    },
    {
      id: 'all',
      label: 'All Titles',
      name: 'All Catalog',
      icon: 'grid_view',
      count: counts.total,
      badge: '910+ Total',
      description: 'Combined master catalog across all formats',
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-surface-border pb-6">
        <div className="border-l-4 border-amber-gold pl-3">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-amber-gold">
            Discovery Catalog
          </span>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-text-primary leading-none">
            {type === 'movie'
              ? 'Movies & Feature Films'
              : type === 'tv'
              ? 'TV Series & Television'
              : type === 'web_series'
              ? 'Web Series & Originals'
              : 'Explore Cinema & Series'}
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={`Search in ${type === 'movie' ? 'Movies' : type === 'tv' ? 'TV Series' : 'Catalog'}...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-card border border-surface-border text-xs sm:text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold shadow-lg font-body-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top-Level Dedicated Category Pages Rail */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categoryTabs.map((tab) => {
          const isActive = type === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTypeChange(tab.id as any)}
              className={cn(
                'group relative flex flex-col p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer overflow-hidden shadow-lg',
                isActive
                  ? 'bg-amber-gold/15 border-amber-gold/60 shadow-amber-gold/10 ring-1 ring-amber-gold/50'
                  : 'bg-surface-card border-surface-border hover:border-amber-gold/30 hover:bg-surface-elevated'
              )}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span
                  className={cn(
                    'material-symbols-outlined text-2xl p-2 rounded-xl transition-colors',
                    isActive ? 'bg-amber-gold text-surface-void font-bold' : 'bg-surface-elevated text-text-muted group-hover:text-amber-gold'
                  )}
                >
                  {tab.icon}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-mono px-2 py-0.5 rounded-full font-bold',
                    isActive ? 'bg-amber-gold text-surface-void' : 'bg-surface-elevated text-text-muted'
                  )}
                >
                  {tab.badge}
                </span>
              </div>
              <h3 className={cn('font-bold text-sm sm:text-base', isActive ? 'text-amber-gold' : 'text-text-primary group-hover:text-amber-gold')}>
                {tab.name}
              </h3>
              <p className="text-[11px] text-text-muted line-clamp-1 mt-0.5">
                {tab.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* 3. Country-Wise Cinema Filter Hub */}
      <section className="bg-surface-card border border-surface-border rounded-xl p-4 sm:p-5 shadow-2xl space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-gold/15 border border-amber-gold/30 text-amber-gold flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg">public</span>
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2">
                <span>Filter by Country of Origin &amp; Heritage</span>
                <span className="text-[10px] bg-amber-gold/20 text-amber-gold px-1.5 py-0.2 rounded font-mono font-bold">
                  12 Cinema Hubs
                </span>
              </h2>
              <p className="text-[11px] text-text-muted">
                Showing films and series produced natively in selected film industries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] text-text-muted">Active:</span>
            <span className="text-xs font-bold text-amber-gold font-mono bg-surface-elevated px-2 py-0.5 rounded border border-surface-border">
              {originCountry === 'all' ? '🌐 All World Origins' : `${selectedCountryConfig?.flag} ${selectedCountryConfig?.name}`}
            </span>
          </div>
        </div>

        {/* 1-Click Country Selector Rail */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          <button
            type="button"
            onClick={() => handleCountryPillClick('all')}
            className={cn(
              'px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border',
              originCountry === 'all'
                ? 'bg-amber-gold text-surface-void border-amber-gold glow-gold shadow-md'
                : 'bg-surface-elevated text-text-secondary border-surface-border hover:text-text-primary hover:border-amber-gold/40'
            )}
          >
            <span>🌐</span>
            <span>All World</span>
          </button>

          {COUNTRIES.map((c) => {
            const isSelected = originCountry.toUpperCase() === c.code.toUpperCase();
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => handleCountryPillClick(c.code)}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border',
                  isSelected
                    ? 'bg-amber-gold text-surface-void border-amber-gold glow-gold shadow-md font-bold'
                    : 'bg-surface-elevated text-text-secondary border-surface-border hover:text-text-primary hover:border-amber-gold/40'
                )}
              >
                <span className="text-sm">{c.flag}</span>
                <span>{c.name}</span>
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

      {/* 4. Controls & Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 bg-surface-card p-4 rounded-xl border border-surface-border text-xs shadow-lg">
        {/* Origin Country Filter Dropdown */}
        <div>
          <label className="block text-text-secondary font-bold mb-1.5 flex items-center justify-between">
            <span>Origin Country</span>
            <span className="text-[10px] text-amber-gold font-bold">Heritage</span>
          </label>
          <select
            value={originCountry}
            onChange={(e) => {
              setOriginCountry(e.target.value);
              setCurrentPage(1);
            }}
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
              setCurrentPage(1);
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

        {/* Streaming Platform */}
        <div>
          <label className="block text-text-secondary font-bold mb-1.5">Platform</label>
          <select
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              setCurrentPage(1);
            }}
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
            onChange={(e) => {
              setGenre(e.target.value);
              setCurrentPage(1);
            }}
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
            onChange={(e) => {
              setLanguage(e.target.value);
              setCurrentPage(1);
            }}
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
            onChange={(e) => {
              setRatingMin(Number(e.target.value));
              setCurrentPage(1);
            }}
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

      {/* 5. Results Counter & Pagination Controls Bar */}
      <div ref={resultsGridRef} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-card p-4 rounded-xl border border-surface-border text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-text-secondary">
              Showing <strong className="text-text-primary">{(activePage - 1) * itemsPerPage + 1} - {Math.min(activePage * itemsPerPage, totalItems)}</strong> of <strong className="text-amber-gold">{totalItems}</strong> {type === 'movie' ? 'movies' : type === 'tv' ? 'TV series' : 'titles'}
            </span>
            <span className="text-text-muted">•</span>
            <span className="text-text-muted">
              Page <strong className="text-text-primary">{activePage}</strong> of <strong className="text-text-primary">{totalPages}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-text-secondary font-semibold">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-gold" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="bg-surface-elevated text-text-primary border border-surface-border rounded px-2.5 py-1.5 outline-none font-bold cursor-pointer hover:border-amber-gold/50 transition-colors text-xs"
              >
                <option value="bayesian">Bayesian Weighted Rating</option>
                <option value="popularity">Popularity / Trending</option>
                <option value="releaseDate">Release Date (Newest)</option>
                <option value="votes">Total Vote Count</option>
                <option value="title">Alphabetical (A - Z)</option>
              </select>
            </div>

            {/* Per-Page Selector */}
            <div className="flex items-center gap-1.5 text-text-muted">
              <span>Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-surface-elevated text-text-primary border border-surface-border rounded px-2 py-1 outline-none text-xs font-bold"
              >
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={72}>72</option>
              </select>
            </div>
          </div>
        </div>

        {/* 6. Grid View (Rendered in Instant-Loading Chunks of 24) */}
        {paginatedItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
            {paginatedItems.map((movie, idx) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                rank={sortBy === 'bayesian' ? (activePage - 1) * itemsPerPage + idx + 1 : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-card rounded-xl border border-surface-border space-y-3">
            <Film className="w-14 h-14 text-text-muted mx-auto" />
            <h3 className="text-lg font-bold text-text-primary">No titles match your filter criteria</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Try resetting your country, format, or genre filters to browse our complete collection.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-surface-elevated hover:bg-surface-border text-text-primary rounded text-xs font-bold transition-colors border border-surface-border"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* 7. Bottom Pagination Navigation */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-4 pt-6 border-t border-surface-border bg-surface-card p-4 rounded-xl">
            <div className="text-xs text-text-muted">
              Showing page <strong className="text-text-primary">{activePage}</strong> of <strong className="text-text-primary">{totalPages}</strong> ({totalItems} total {type === 'movie' ? 'movies' : type === 'tv' ? 'TV series' : 'titles'})
            </div>

            <div className="flex items-center gap-1.5">
              {/* First Page */}
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={activePage === 1}
                className="p-2 rounded-lg bg-surface-elevated border border-surface-border text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Prev Page */}
              <button
                type="button"
                onClick={() => handlePageChange(activePage - 1)}
                disabled={activePage === 1}
                className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              {/* Numeric Page Buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - activePage) <= 2)
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && p - prev > 1;

                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="px-1 text-text-muted text-xs">...</span>}
                        <button
                          type="button"
                          onClick={() => handlePageChange(p)}
                          className={cn(
                            'min-w-[32px] h-8 rounded-lg text-xs font-bold transition-all',
                            activePage === p
                              ? 'bg-amber-gold text-surface-void font-bold shadow-md shadow-amber-gold/20'
                              : 'bg-surface-elevated text-text-secondary hover:text-text-primary border border-surface-border'
                          )}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              {/* Next Page */}
              <button
                type="button"
                onClick={() => handlePageChange(activePage + 1)}
                disabled={activePage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Last Page */}
              <button
                type="button"
                onClick={() => handlePageChange(totalPages)}
                disabled={activePage === totalPages}
                className="p-2 rounded-lg bg-surface-elevated border border-surface-border text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
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
