'use client';

import React, { Suspense, useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { INITIAL_MOVIES, ALL_GENRES } from '@/lib/data/mockMovies';
import { TitleItem } from '@/types/movie';
import { MovieCard } from '@/components/MovieCard';
import {
  Film,
  Globe,
  SlidersHorizontal,
  Sparkles,
  Star,
  Layers,
  ArrowRight,
  Tv,
  Clapperboard,
  Check,
  Flame,
  Search,
  Grid3X3,
  ListFilter,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageDef {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
  gradient: string;
}

const CLASSIFIED_LANGUAGES: LanguageDef[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'Bollywood & Hindi Cinema', gradient: 'from-amber-600/30 to-orange-800/30' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸 🇬🇧', region: 'Hollywood & Global Cinema', gradient: 'from-blue-600/30 to-indigo-800/30' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', region: 'Tollywood & Pan-Indian Epics', gradient: 'from-yellow-600/30 to-amber-800/30' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', region: 'Kollywood & South Cinema', gradient: 'from-red-600/30 to-rose-800/30' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', region: 'K-Drama & Korean Cinema', gradient: 'from-pink-600/30 to-rose-800/30' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', region: 'Anime & Japanese Cinema', gradient: 'from-purple-600/30 to-violet-800/30' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', region: 'Mollywood Cinema', gradient: 'from-emerald-600/30 to-teal-800/30' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸 🇲🇽', region: 'Hispanic & Latin Cinema', gradient: 'from-orange-600/30 to-red-800/30' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'French World Cinema', gradient: 'from-cyan-600/30 to-blue-800/30' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', region: 'German & European Cinema', gradient: 'from-zinc-600/30 to-stone-800/30' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷 🇵🇹', region: 'Brazilian & Portuguese Cinema', gradient: 'from-green-600/30 to-emerald-800/30' },
];

const GENRE_METADATA: Record<string, { icon: string; description: string; gradient: string }> = {
  Action: { icon: '💥', description: 'High-octane blockbusters, stunts, and adrenaline-fueled chases', gradient: 'from-red-900/40 via-orange-950/20 to-black' },
  Adventure: { icon: '🧭', description: 'Epic quests, exploration, uncharted worlds and journeys', gradient: 'from-amber-900/40 via-yellow-950/20 to-black' },
  Animation: { icon: '🎨', description: 'Visual masterpieces, anime, CGI artistry and storytelling', gradient: 'from-purple-900/40 via-indigo-950/20 to-black' },
  Comedy: { icon: '😂', description: 'Humor, satire, witty dialogue and feel-good entertainment', gradient: 'from-yellow-900/40 via-amber-950/20 to-black' },
  Crime: { icon: '🕵️', description: 'Underworld sagas, detective investigations and mob epics', gradient: 'from-zinc-900/60 via-slate-950/40 to-black' },
  Documentary: { icon: '📽️', description: 'Real-world exposés, biographies, science and history', gradient: 'from-teal-900/40 via-cyan-950/20 to-black' },
  Drama: { icon: '🎭', description: 'Compelling narratives, human emotion, and character studies', gradient: 'from-blue-900/40 via-indigo-950/20 to-black' },
  Fantasy: { icon: '🧙', description: 'Mythology, ancient magic, mythical realms and legends', gradient: 'from-violet-900/40 via-purple-950/20 to-black' },
  History: { icon: '🏛️', description: 'Historical milestones, epochal figures, and real chronicles', gradient: 'from-amber-950/50 via-stone-900/30 to-black' },
  Horror: { icon: '👻', description: 'Psychological terror, supernatural chills, and suspense', gradient: 'from-rose-950/50 via-zinc-950/30 to-black' },
  Mystery: { icon: '🔍', description: 'Whodunits, enigmatic puzzles, plot twists and secrets', gradient: 'from-indigo-950/50 via-slate-900/30 to-black' },
  Romance: { icon: '❤️', description: 'Love stories, emotional bonds, passion and romantic journeys', gradient: 'from-pink-900/40 via-rose-950/20 to-black' },
  'Science Fiction': { icon: '🚀', description: 'Futuristic technology, space travel, AI and parallel dimensions', gradient: 'from-cyan-900/40 via-sky-950/20 to-black' },
  Thriller: { icon: '⚡', description: 'Edge-of-the-seat tension, conspiracy plots and cliffhangers', gradient: 'from-emerald-900/40 via-teal-950/20 to-black' },
};

function ClassifiedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active filters
  const initialGenre = searchParams.get('genre') || 'all';
  const initialLang = searchParams.get('lang') || 'all';
  const initialType = searchParams.get('type') || 'all';
  const initialTab = searchParams.get('tab') || 'matrix';

  const [activeTab, setActiveTab] = useState<'matrix' | 'genres' | 'languages'>(
    initialTab as any
  );
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre);
  const [selectedLang, setSelectedLang] = useState<string>(initialLang);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [worldwideResults, setWorldwideResults] = useState<TitleItem[]>([]);
  const [isSearchingWorldwide, setIsSearchingWorldwide] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    const g = searchParams.get('genre') || 'all';
    const l = searchParams.get('lang') || 'all';
    const t = searchParams.get('type') || 'all';
    const tab = searchParams.get('tab');
    if (g !== selectedGenre) setSelectedGenre(g);
    if (l !== selectedLang) setSelectedLang(l);
    if (t !== selectedType) setSelectedType(t);
    if (tab && ['matrix', 'genres', 'languages'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  // Update URL on filter changes
  const applyFilters = (genre: string, lang: string, type: string, tab: string) => {
    const params = new URLSearchParams();
    if (genre !== 'all') params.set('genre', genre);
    if (lang !== 'all') params.set('lang', lang);
    if (type !== 'all') params.set('type', type);
    if (tab !== 'matrix') params.set('tab', tab);
    router.replace(`/categories?${params.toString()}`);
  };

  const handleGenreSelect = (g: string) => {
    const newG = selectedGenre === g ? 'all' : g;
    setSelectedGenre(newG);
    applyFilters(newG, selectedLang, selectedType, activeTab);
  };

  const handleLangSelect = (l: string) => {
    const newL = selectedLang === l ? 'all' : l;
    setSelectedLang(newL);
    applyFilters(selectedGenre, newL, selectedType, activeTab);
  };

  const handleTabChange = (tab: 'matrix' | 'genres' | 'languages') => {
    setActiveTab(tab);
    applyFilters(selectedGenre, selectedLang, selectedType, tab);
  };

  const handleReset = () => {
    setSelectedGenre('all');
    setSelectedLang('all');
    setSelectedType('all');
    setSearchFilter('');
    router.replace('/categories');
  };

  // Filter local catalog
  const filteredTitles = useMemo(() => {
    return INITIAL_MOVIES.filter((movie) => {
      // Type
      if (selectedType !== 'all' && movie.type !== selectedType) return false;

      // Genre
      if (selectedGenre !== 'all') {
        const hasGenre = movie.genres.some(
          (g) => g.name.toLowerCase() === selectedGenre.toLowerCase()
        );
        if (!hasGenre) return false;
      }

      // Language
      if (selectedLang !== 'all' && movie.originalLanguage !== selectedLang) {
        return false;
      }

      // Search filter text
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchesTitle = movie.title.toLowerCase().includes(q);
        const matchesCast = movie.cast?.some((c) => c.name.toLowerCase().includes(q));
        const matchesDirector = movie.directors?.some((d) => d.name.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCast && !matchesDirector) return false;
      }

      return true;
    }).sort((a, b) => b.ratings.bayesianScore - a.ratings.bayesianScore);
  }, [selectedGenre, selectedLang, selectedType, searchFilter]);

  // Live worldwide search when both genre and language are selected or user wants more
  const triggerWorldwideFetch = () => {
    setIsSearchingWorldwide(true);
    const query = [
      selectedGenre !== 'all' ? selectedGenre : '',
      selectedLang !== 'all' ? selectedLang : '',
    ]
      .filter(Boolean)
      .join(' ') || 'movie';

    fetch(`/api/worldwide/search?q=${encodeURIComponent(query)}&type=${selectedType}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.results)) {
          const existingIds = new Set(filteredTitles.map((t) => t.id));
          const additions = data.results.filter((w: TitleItem) => !existingIds.has(w.id));
          setWorldwideResults(additions);
        }
      })
      .catch((err) => console.warn('Worldwide fetch error:', err))
      .finally(() => setIsSearchingWorldwide(false));
  };

  // Genre counts in current catalog
  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_GENRES.forEach((g) => (counts[g] = 0));
    INITIAL_MOVIES.forEach((m) => {
      m.genres.forEach((g) => {
        if (counts[g.name] !== undefined) counts[g.name]++;
      });
    });
    return counts;
  }, []);

  // Language counts in current catalog
  const langCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CLASSIFIED_LANGUAGES.forEach((l) => (counts[l.code] = 0));
    INITIAL_MOVIES.forEach((m) => {
      if (counts[m.originalLanguage] !== undefined) {
        counts[m.originalLanguage]++;
      }
    });
    return counts;
  }, []);

  const activeGenreMeta = selectedGenre !== 'all' ? GENRE_METADATA[selectedGenre] : null;
  const activeLangMeta =
    selectedLang !== 'all' ? CLASSIFIED_LANGUAGES.find((l) => l.code === selectedLang) : null;

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 p-6 sm:p-10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cinema-gold/15 border border-cinema-gold/30 text-cinema-gold text-xs font-black uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Catalog Classification Engine</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Classified by <span className="gold-gradient-text">Genre & Language</span>
            </h1>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Explore cinema, TV shows, and web series categorized by storytelling genre and global language.
              Discover Bollywood, Hollywood, Tollywood, K-Dramas, Anime, and world cinema with Bayesian star ratings.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-center">
              <div className="text-2xl font-black text-cinema-gold">{ALL_GENRES.length}</div>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">Genres</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-center">
              <div className="text-2xl font-black text-white">{CLASSIFIED_LANGUAGES.length}+</div>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">Languages</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-center col-span-2 sm:col-span-1">
              <div className="text-2xl font-black text-emerald-400">11.2M+</div>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">Global Coverage</div>
            </div>
          </div>
        </div>

        {/* View Mode Switcher Tabs */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-white/10">
          <button
            onClick={() => handleTabChange('matrix')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all',
              activeTab === 'matrix'
                ? 'bg-cinema-gold text-black shadow-lg shadow-amber-500/25'
                : 'glass-panel text-zinc-300 hover:text-white hover:bg-white/10'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Cross-Matrix Classifier (Genre + Language)</span>
          </button>

          <button
            onClick={() => handleTabChange('genres')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all',
              activeTab === 'genres'
                ? 'bg-cinema-gold text-black shadow-lg shadow-amber-500/25'
                : 'glass-panel text-zinc-300 hover:text-white hover:bg-white/10'
            )}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>All Genres Directory</span>
          </button>

          <button
            onClick={() => handleTabChange('languages')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all',
              activeTab === 'languages'
                ? 'bg-cinema-gold text-black shadow-lg shadow-amber-500/25'
                : 'glass-panel text-zinc-300 hover:text-white hover:bg-white/10'
            )}
          >
            <Globe className="w-4 h-4" />
            <span>All Languages Directory</span>
          </button>
        </div>
      </div>

      {/* 2. TAB: ALL GENRES DIRECTORY */}
      {activeTab === 'genres' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Select a Genre to Explore</h2>
              <p className="text-xs text-zinc-400">Click any genre below to classify titles and filter results</p>
            </div>
            {selectedGenre !== 'all' && (
              <button
                onClick={() => handleGenreSelect('all')}
                className="text-xs font-bold text-cinema-gold hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Genre Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {ALL_GENRES.map((g) => {
              const meta = GENRE_METADATA[g] || { icon: '🎬', description: '', gradient: 'from-zinc-900 to-black' };
              const isSelected = selectedGenre === g;
              const count = genreCounts[g] || 0;

              return (
                <button
                  key={g}
                  onClick={() => handleGenreSelect(g)}
                  className={cn(
                    'relative p-4 rounded-2xl border text-left transition-all duration-300 group overflow-hidden flex flex-col justify-between min-h-[120px]',
                    isSelected
                      ? 'border-cinema-gold bg-cinema-gold/15 shadow-xl shadow-amber-500/20 scale-[1.02]'
                      : 'border-white/10 glass-panel hover:border-cinema-gold/50 hover:bg-white/[0.06]'
                  )}
                >
                  <div className="text-2xl mb-2">{meta.icon}</div>
                  <div>
                    <div className={cn('text-sm font-black transition-colors', isSelected ? 'text-cinema-gold' : 'text-white group-hover:text-cinema-gold')}>
                      {g}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-semibold mt-0.5">
                      {count} title{count === 1 ? '' : 's'}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cinema-gold text-black flex items-center justify-center text-xs font-black">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TAB: ALL LANGUAGES DIRECTORY */}
      {activeTab === 'languages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Select a Language to Explore</h2>
              <p className="text-xs text-zinc-400">Classify movies and shows by regional industry and native language</p>
            </div>
            {selectedLang !== 'all' && (
              <button
                onClick={() => handleLangSelect('all')}
                className="text-xs font-bold text-cinema-gold hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Language Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CLASSIFIED_LANGUAGES.map((l) => {
              const isSelected = selectedLang === l.code;
              const count = langCounts[l.code] || 0;

              return (
                <button
                  key={l.code}
                  onClick={() => handleLangSelect(l.code)}
                  className={cn(
                    'relative p-5 rounded-2xl border text-left transition-all duration-300 group overflow-hidden flex flex-col justify-between min-h-[140px]',
                    isSelected
                      ? 'border-cinema-gold bg-cinema-gold/15 shadow-xl shadow-amber-500/20 scale-[1.02]'
                      : 'border-white/10 glass-panel hover:border-cinema-gold/50 hover:bg-white/[0.06]'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{l.flag}</span>
                    <span className="text-xs font-mono font-bold text-zinc-500 uppercase px-2 py-0.5 rounded-md bg-white/5">
                      {l.code}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className={cn('text-lg font-black', isSelected ? 'text-cinema-gold' : 'text-white group-hover:text-cinema-gold')}>
                        {l.name}
                      </span>
                      <span className="text-xs font-bold text-zinc-400">({l.nativeName})</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{l.region}</div>
                    <div className="text-xs font-bold text-cinema-gold/90 mt-2">
                      {count} title{count === 1 ? '' : 's'} in catalog
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute top-3 right-10 w-5 h-5 rounded-full bg-cinema-gold text-black flex items-center justify-center text-xs font-black">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TAB: CROSS-MATRIX CLASSIFIER CONTROLS */}
      {activeTab === 'matrix' && (
        <div className="space-y-6 glass-panel p-6 rounded-3xl border border-white/10 shadow-xl">
          {/* Section A: Genre Selector Chips */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Clapperboard className="w-3.5 h-3.5 text-cinema-gold" />
                <span>1. Select Genre</span>
              </label>
              {selectedGenre !== 'all' && (
                <span className="text-xs text-cinema-gold font-bold">
                  Active: {selectedGenre} ({genreCounts[selectedGenre] || 0} titles)
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleGenreSelect('all')}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                  selectedGenre === 'all'
                    ? 'bg-cinema-gold text-black shadow-md shadow-amber-500/25'
                    : 'glass-panel text-zinc-400 hover:text-white'
                )}
              >
                All Genres
              </button>

              {ALL_GENRES.map((g) => {
                const isSelected = selectedGenre === g;
                const count = genreCounts[g] || 0;
                return (
                  <button
                    key={g}
                    onClick={() => handleGenreSelect(g)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5',
                      isSelected
                        ? 'bg-cinema-gold text-black shadow-md shadow-amber-500/25'
                        : 'glass-panel text-zinc-300 hover:text-white hover:border-white/20'
                    )}
                  >
                    <span>{GENRE_METADATA[g]?.icon}</span>
                    <span>{g}</span>
                    <span className={cn('text-[10px] px-1.5 py-0.2 rounded-full font-mono', isSelected ? 'bg-black/30 text-black' : 'bg-white/10 text-zinc-400')}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section B: Language Selector Chips */}
          <div className="space-y-2.5 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cinema-gold" />
                <span>2. Select Language</span>
              </label>
              {selectedLang !== 'all' && (
                <span className="text-xs text-cinema-gold font-bold">
                  Active: {CLASSIFIED_LANGUAGES.find((l) => l.code === selectedLang)?.name || selectedLang}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleLangSelect('all')}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                  selectedLang === 'all'
                    ? 'bg-cinema-gold text-black shadow-md shadow-amber-500/25'
                    : 'glass-panel text-zinc-400 hover:text-white'
                )}
              >
                All Languages
              </button>

              {CLASSIFIED_LANGUAGES.map((l) => {
                const isSelected = selectedLang === l.code;
                const count = langCounts[l.code] || 0;
                return (
                  <button
                    key={l.code}
                    onClick={() => handleLangSelect(l.code)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5',
                      isSelected
                        ? 'bg-cinema-gold text-black shadow-md shadow-amber-500/25'
                        : 'glass-panel text-zinc-300 hover:text-white hover:border-white/20'
                    )}
                  >
                    <span>{l.flag}</span>
                    <span>{l.name}</span>
                    <span className={cn('text-[10px] px-1.5 py-0.2 rounded-full font-mono', isSelected ? 'bg-black/30 text-black' : 'bg-white/10 text-zinc-400')}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section C: Format Type & Text Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/10">
            {/* Format type buttons */}
            <div className="flex items-center gap-2">
              {[
                { id: 'all', label: 'All Formats' },
                { id: 'movie', label: 'Movies' },
                { id: 'tv', label: 'TV Shows' },
                { id: 'web_series', label: 'Web Series' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedType(item.id);
                    applyFilters(selectedGenre, selectedLang, item.id, activeTab);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                    selectedType === item.id
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'text-zinc-400 hover:text-white'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Quick search input within classification */}
            <div className="relative sm:w-72">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter results by title, cast..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-zinc-500 outline-none focus:border-cinema-gold"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      )}

      {/* 5. ACTIVE CLASSIFICATION SUMMARY BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <span className="font-bold text-zinc-400">Classification:</span>

          {/* Genre Tag */}
          <span className="px-2.5 py-1 rounded-lg bg-cinema-gold/15 border border-cinema-gold/40 text-cinema-gold font-bold flex items-center gap-1">
            <span>Genre:</span>
            <strong className="text-white">{selectedGenre === 'all' ? 'All Genres' : selectedGenre}</strong>
          </span>

          <span className="text-zinc-600 font-bold">•</span>

          {/* Language Tag */}
          <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/40 text-blue-300 font-bold flex items-center gap-1">
            <span>Language:</span>
            <strong className="text-white">
              {selectedLang === 'all'
                ? 'All Languages'
                : `${CLASSIFIED_LANGUAGES.find((l) => l.code === selectedLang)?.name || selectedLang}`}
            </strong>
          </span>

          {selectedType !== 'all' && (
            <>
              <span className="text-zinc-600 font-bold">•</span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/40 text-purple-300 font-bold">
                {selectedType === 'movie' ? 'Movies Only' : selectedType === 'tv' ? 'TV Shows' : 'Web Series'}
              </span>
            </>
          )}

          <span className="ml-2 text-xs text-zinc-400 font-bold">
            ({filteredTitles.length + worldwideResults.length} matching titles)
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {(selectedGenre !== 'all' || selectedLang !== 'all' || selectedType !== 'all') && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl glass-panel text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-white/10"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>
          )}

          <button
            onClick={triggerWorldwideFetch}
            disabled={isSearchingWorldwide}
            className="px-3.5 py-1.5 rounded-xl bg-cinema-gold text-black hover:bg-amber-400 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50"
            title="Fetch additional matching titles from TMDB, Cinemeta, and TVMaze"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSearchingWorldwide ? 'Searching Worldwide...' : 'Expand Worldwide'}</span>
          </button>
        </div>
      </div>

      {/* 6. CLASSIFIED RESULTS GRID */}
      {filteredTitles.length === 0 && worldwideResults.length === 0 ? (
        <div className="text-center py-16 px-4 glass-panel rounded-3xl border border-white/10 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-cinema-gold flex items-center justify-center mx-auto">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white">No exact matches in the local catalog</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            We didn&apos;t find titles for Genre: <strong>{selectedGenre}</strong> + Language: <strong>{selectedLang}</strong> in the primary store.
            Click below to scan 11.2M+ global records on TMDB and Cinemeta.
          </p>
          <div className="pt-2">
            <button
              onClick={triggerWorldwideFetch}
              className="px-5 py-2.5 rounded-xl bg-cinema-gold text-black font-black text-xs hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/25"
            >
              Search 11.2M+ Worldwide Titles
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredTitles.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
            {worldwideResults.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      )}

      {/* 7. QUICK POPULAR CLASSIFIED COMBINATIONS */}
      <div className="pt-8 border-t border-white/10 space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <span>Popular Genre & Language Classifications</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
          {[
            { label: 'Hindi Action Sagas', genre: 'Action', lang: 'hi', flag: '🇮🇳' },
            { label: 'Telugu Pan-India Epics', genre: 'Action', lang: 'te', flag: '🇮🇳' },
            { label: 'Hollywood Sci-Fi', genre: 'Science Fiction', lang: 'en', flag: '🇺🇸' },
            { label: 'K-Drama Thrillers', genre: 'Thriller', lang: 'ko', flag: '🇰🇷' },
            { label: 'Japanese Anime Fantasy', genre: 'Animation', lang: 'ja', flag: '🇯🇵' },
            { label: 'Hindi Crime Dramas', genre: 'Crime', lang: 'hi', flag: '🇮🇳' },
            { label: 'Hollywood Drama', genre: 'Drama', lang: 'en', flag: '🇬🇧' },
            { label: 'Tamil Crime Thrillers', genre: 'Thriller', lang: 'ta', flag: '🇮🇳' },
            { label: 'Malayalam Mystery', genre: 'Mystery', lang: 'ml', flag: '🇮🇳' },
            { label: 'Romantic Comedies', genre: 'Romance', lang: 'en', flag: '🇺🇸' },
            { label: 'Spanish Heist & Crime', genre: 'Crime', lang: 'es', flag: '🇪🇸' },
            { label: 'Global Horror Chills', genre: 'Horror', lang: 'en', flag: '🌍' },
          ].map((combo) => (
            <button
              key={combo.label}
              onClick={() => {
                setSelectedGenre(combo.genre);
                setSelectedLang(combo.lang);
                setActiveTab('matrix');
                applyFilters(combo.genre, combo.lang, selectedType, 'matrix');
              }}
              className="p-3 rounded-xl glass-panel border border-white/10 hover:border-cinema-gold/60 text-left transition-all group"
            >
              <div className="text-base mb-1">{combo.flag}</div>
              <div className="font-bold text-white group-hover:text-cinema-gold line-clamp-1">{combo.label}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                {combo.genre} • {combo.lang.toUpperCase()}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cinema-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ClassifiedContent />
    </Suspense>
  );
}
