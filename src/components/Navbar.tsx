'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MovieImage } from './MovieImage';
import { usePathname, useRouter } from 'next/navigation';
import {
  Star,
  Search,
  Sparkles,
  Film,
  Bookmark,
  Settings,
  Menu,
  X,
  Globe,
  User,
  LogOut,
  Trophy,
  Tv,
  Users,
  Compass,
  PlaySquare,
  ChevronDown,
  ArrowRight,
  Plus,
  Check,
  Award,
} from 'lucide-react';
import { COUNTRIES } from '@/lib/data/mockMovies';
import { getSelectedCountry, setSelectedCountry, getClientState, toggleListStatus } from '@/lib/storage';
import { SearchModal } from './SearchModal';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { searchCatalogAutocomplete } from '@/lib/api/movieStore';
import { TitleItem } from '@/types/movie';
import { getTmdbImageUrl } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [activeCountry, setActiveCountry] = useState('IN');
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [authUser, setAuthUser] = useState<any>(null);

  // Live Inline Search State in Navbar
  const [navQuery, setNavQuery] = useState('');
  const [navSuggestions, setNavSuggestions] = useState<TitleItem[]>([]);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveCountry(getSelectedCountry());
    const s = getClientState();
    setWatchlistCount(s.watchlist.length);
    setWatchlistIds(s.watchlist);

    const checkAuth = () => {
      try {
        const raw = localStorage.getItem('moviestars_auth_user');
        if (raw) setAuthUser(JSON.parse(raw));
        else setAuthUser(null);
      } catch {
        setAuthUser(null);
      }
    };

    checkAuth();

    const handleUpdate = () => {
      setActiveCountry(getSelectedCountry());
      const state = getClientState();
      setWatchlistCount(state.watchlist.length);
      setWatchlistIds(state.watchlist);
      checkAuth();
    };

    window.addEventListener('moviestars_country_updated', handleUpdate);
    window.addEventListener('moviestars_state_updated', handleUpdate);
    window.addEventListener('moviestars_auth_updated', handleUpdate);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsNavDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('moviestars_country_updated', handleUpdate);
      window.removeEventListener('moviestars_state_updated', handleUpdate);
      window.removeEventListener('moviestars_auth_updated', handleUpdate);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update suggestions on keystroke
  useEffect(() => {
    if (!navQuery.trim()) {
      setNavSuggestions([]);
      setIsNavDropdownOpen(false);
      return;
    }
    const matches = searchCatalogAutocomplete(navQuery, 5);
    setNavSuggestions(matches);
    setIsNavDropdownOpen(true);
  }, [navQuery]);

  const handleNavSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!navQuery.trim()) return;
    setIsNavDropdownOpen(false);
    router.push(`/search?q=${encodeURIComponent(navQuery.trim())}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('moviestars_auth_token');
    localStorage.removeItem('moviestars_auth_user');
    setAuthUser(null);
    window.dispatchEvent(new Event('moviestars_auth_updated'));
    router.push('/');
  };

  const navLinks = [
    { label: 'Browse', href: '/browse', icon: Film },
    { label: 'Search', href: '/search', icon: Search, highlight: true },
    { label: 'Upcoming', href: '/upcoming', icon: Sparkles, badge: 'Live' },
    { label: 'Top 250', href: '/top-rated', icon: Trophy },
    { label: 'Watchlist', href: '/watchlist', icon: Bookmark, count: watchlistCount },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#121212]/95 backdrop-blur-2xl transition-all shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Left Brand & Menu Drawer Button */}
          <div className="flex items-center gap-3">
            {/* IMDb-Style Yellow Brand Badge */}
            <Link href="/" className="flex items-center group select-none">
              <div className="px-2.5 py-1 rounded-md bg-[#f5c518] text-black font-black text-lg tracking-tighter shadow-md shadow-amber-500/20 group-hover:bg-[#f6cd37] transition-all flex items-center gap-1">
                <span>MovieStars</span>
                <Star className="w-3.5 h-3.5 fill-black text-black" />
              </div>
            </Link>

            {/* IMDb-Style "Menu" Drawer Trigger */}
            <button
              onClick={() => setMenuDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/10 text-white font-bold text-xs transition-colors cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 text-[#f5c518]" />
              <span className="hidden sm:inline">Menu</span>
            </button>
          </div>

          {/* Center: Live Interactive Search Input Bar with Instant Dropdown */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-xl mx-2">
            <form
              onSubmit={handleNavSearchSubmit}
              className="relative flex items-center bg-zinc-900/90 border border-white/15 focus-within:border-[#f5c518] rounded-xl px-3 py-1.5 transition-all shadow-inner"
            >
              <Link
                href="/search"
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-white border-r border-white/10 pr-2.5 mr-2 shrink-0"
                title="Go to Full Search Page"
              >
                <span>All</span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </Link>
              <Search className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
              <input
                type="text"
                value={navQuery}
                onChange={(e) => setNavQuery(e.target.value)}
                onFocus={() => {
                  if (navQuery.trim()) setIsNavDropdownOpen(true);
                }}
                placeholder="Search movies, TV shows, actors, directors..."
                className="w-full bg-transparent text-white placeholder-zinc-500 text-xs font-semibold outline-none"
              />
              {navQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setNavQuery('');
                    setIsNavDropdownOpen(false);
                  }}
                  className="p-1 text-zinc-500 hover:text-white mr-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <kbd
                onClick={() => setSearchOpen(true)}
                className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 border border-white/15 text-[10px] font-mono text-zinc-400 cursor-pointer hover:border-white/30"
                title="Press / or ⌘K for command palette"
              >
                /
              </kbd>
            </form>

            {/* Instant Keystroke Autocomplete Dropdown */}
            <AnimatePresence>
              {isNavDropdownOpen && navSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-[#1a1a1a] border border-white/15 shadow-2xl overflow-hidden z-50 divide-y divide-white/5"
                >
                  {navSuggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setIsNavDropdownOpen(false);
                        router.push(`/title/${item.id}`);
                      }}
                      className="p-2.5 flex items-center justify-between hover:bg-white/10 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-9 h-12 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
                          <MovieImage
                            src={getTmdbImageUrl(item.posterPath, 'w185')}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white group-hover:text-[#f5c518] truncate transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                            <span>{item.releaseDate?.slice(0, 4)}</span>
                            <span>•</span>
                            <span className="capitalize">{item.type.replace('_', ' ')}</span>
                            <span>•</span>
                            <span className="text-[#f5c518] font-bold">★ {item.ratings.imdb.score.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Save to Watchlist Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleListStatus(item.id, 'watchlist', item.title);
                        }}
                        className={cn(
                          'p-1.5 rounded-lg transition-colors ml-2 shrink-0',
                          watchlistIds.includes(item.id)
                            ? 'bg-[#f5c518] text-black'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        )}
                        title={
                          watchlistIds.includes(item.id)
                            ? 'In Watchlist'
                            : 'Add to Watchlist (Want to Watch)'
                        }
                      >
                        {watchlistIds.includes(item.id) ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                      </button>
                    </div>
                  ))}

                  {/* Dropdown Footer: See all results */}
                  <Link
                    href={`/search?q=${encodeURIComponent(navQuery)}`}
                    onClick={() => setIsNavDropdownOpen(false)}
                    className="p-2.5 flex items-center justify-between text-xs font-black text-[#f5c518] hover:text-amber-300 bg-black/40 hover:bg-black/60 transition-colors"
                  >
                    <span>See all results for &ldquo;{navQuery}&rdquo;</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Controls: Navigation Links, Watchlist, Country & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                      isActive
                        ? 'text-white bg-white/10 shadow-inner'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]',
                      link.highlight && 'text-[#f5c518] hover:text-amber-300'
                    )}
                  >
                    <Icon className={cn('w-3.5 h-3.5', link.highlight && 'fill-[#f5c518]/20')} />
                    <span>{link.label}</span>

                    {link.badge && (
                      <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black bg-cinema-red text-white uppercase tracking-wider">
                        {link.badge}
                      </span>
                    )}

                    {link.count !== undefined && link.count > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#f5c518] text-black">
                        {link.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Watchlist Ribbon Shortcut for Mobile/Tablet */}
            <Link
              href="/watchlist"
              className="lg:hidden relative p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10"
              title="Watchlist"
            >
              <Bookmark className="w-4 h-4 text-[#f5c518]" />
              {watchlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#f5c518] text-black text-[9px] font-black flex items-center justify-center">
                  {watchlistCount}
                </span>
              )}
            </Link>

            {/* Country Selector Pill */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs shadow-sm">
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={activeCountry}
                onChange={(e) => {
                  setActiveCountry(e.target.value);
                  setSelectedCountry(e.target.value);
                }}
                className="bg-transparent text-zinc-200 outline-none cursor-pointer font-bold text-xs"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-zinc-900 text-white">
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Auth Button or User Profile */}
            {authUser ? (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-900 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-[#f5c518] text-black font-black text-xs flex items-center justify-center">
                  {authUser.displayName[0]}
                </div>
                <span className="hidden md:inline text-xs font-bold text-white max-w-[80px] truncate">
                  {authUser.displayName}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-zinc-400 hover:text-white p-0.5"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#f5c518] hover:bg-amber-400 text-black font-black text-xs transition-colors shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* IMDb-Style Menu Fullscreen / Side Drawer */}
      <AnimatePresence>
        {menuDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Drawer Modal Content */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="relative max-w-4xl mx-auto my-8 p-6 sm:p-10 rounded-3xl bg-[#1a1a1a] border border-white/15 shadow-2xl space-y-8"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-md bg-[#f5c518] text-black font-black text-xl tracking-tighter">
                    MovieStars
                  </div>
                  <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">
                    Site Directory
                  </span>
                </div>
                <button
                  onClick={() => setMenuDrawerOpen(false)}
                  className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid of Menu Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {/* Column 1: Movies */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#f5c518] font-black text-sm uppercase tracking-wider">
                    <Film className="w-4 h-4" />
                    <span>Movies</span>
                  </div>
                  <ul className="space-y-2 text-xs font-semibold text-zinc-300">
                    <li>
                      <Link
                        href="/search?type=movie"
                        onClick={() => setMenuDrawerOpen(false)}
                        className="hover:text-[#f5c518] transition-colors"
                      >
                        Search Movies
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/upcoming"
                        onClick={() => setMenuDrawerOpen(false)}
                        className="hover:text-[#f5c518] transition-colors"
                      >
                        Release Calendar & Upcoming
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/top-rated"
                        onClick={() => setMenuDrawerOpen(false)}
                        className="hover:text-[#f5c518] transition-colors"
                      >
                        Top 250 Movies
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/browse?type=movie"
                        onClick={() => setMenuDrawerOpen(false)}
                        className="hover:text-[#f5c518] transition-colors"
                      >
                        Most Popular Movies
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 2: TV & Web Series */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#f5c518] font-black text-sm uppercase tracking-wider">
                    <Tv className="w-4 h-4" />
                    <span>TV & Series</span>
                  </div>
                  <ul className="space-y-2 text-xs font-semibold text-zinc-300">
                    <li>
                      <Link
                        href="/search?type=series"
                        onClick={() => setMenuDrawerOpen(false)}
                        className="hover:text-[#f5c518] transition-colors"
                      >
                        Search TV & Web Series
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/browse?type=web_series"
                        onClick={() => setMenuDrawerOpen(false)}
                        className="hover:text-[#f5c518] transition-colors"
                      >
                        Indian Web Series
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/browse?type=tv"
                        onClick={() => setMenuDrawerOpen(false)}
                        className="hover:text-[#f5c518] transition-colors"
                      >
                        Top TV Shows
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/browse?provider=Netflix"
                        onClick={() => setMenuDrawerOpen(false)}
                        className="hover:text-[#f5c518] transition-colors"
                      >
                        What&apos;s on Netflix
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 3: Watch & Community */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#f5c518] font-black text-sm uppercase tracking-wider">
                    <PlaySquare className="w-4 h-4" />
                    <span>Watch & Lists</span>
                  </div>
                  <ul className="space-y-2 text-xs font-semibold text-zinc-300">
                    <li>
                      <Link
                        href="/watchlist"
                        onClick={() => setMenuDrawerOpen(false)}
                        className="hover:text-[#f5c518] transition-colors flex items-center justify-between"
                      >
                        <span>Want to Watch (Watchlist)</span>
                        {watchlistCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#f5c518] text-black font-black">
                            {watchlistCount}
                          </span>
                        )}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/search"
                        onClick={() => setMenuDrawerOpen(false)}
                        className="hover:text-[#f5c518] transition-colors"
                      >
                        Search Engine
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/top-rated"
                        onClick={() => setMenuDrawerOpen(false)}
                        className="hover:text-[#f5c518] transition-colors"
                      >
                        Bayesian Best of All Time
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 4: Awards & Events */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#f5c518] font-black text-sm uppercase tracking-wider">
                    <Award className="w-4 h-4" />
                    <span>Awards & Events</span>
                  </div>
                  <ul className="space-y-2 text-xs font-semibold text-zinc-300">
                    <li>
                      <Link
                        href="/top-rated"
                        onClick={() => setMenuDrawerOpen(false)}
                        className="hover:text-[#f5c518] transition-colors"
                      >
                        Oscars & Best Picture Winners
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/#born-today"
                        onClick={() => setMenuDrawerOpen(false)}
                        className="hover:text-[#f5c518] transition-colors"
                      >
                        Born Today • Celebrities
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/top-rated"
                        onClick={() => setMenuDrawerOpen(false)}
                        className="hover:text-[#f5c518] transition-colors"
                      >
                        Cannes & Film Festival Gems
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/upcoming"
                        onClick={() => setMenuDrawerOpen(false)}
                        className="hover:text-[#f5c518] transition-colors"
                      >
                        Most Anticipated Drops
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Command / Search Palette */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
