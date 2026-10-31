'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getClientState } from '@/lib/storage';
import { SearchModal } from './SearchModal';
import { cn } from '@/lib/utils';
import { searchCatalogAutocomplete } from '@/lib/api/movieStore';
import { TitleItem } from '@/types/movie';
import { MovieImage } from './MovieImage';
import { getTmdbImageUrl } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [authUser, setAuthUser] = useState<any>(null);

  // Live Inline Search State in Navbar
  const [navQuery, setNavQuery] = useState('');
  const [navSuggestions, setNavSuggestions] = useState<TitleItem[]>([]);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = getClientState();
    setWatchlistCount(s.watchlist.length);

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
      const state = getClientState();
      setWatchlistCount(state.watchlist.length);
      checkAuth();
    };

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
      window.removeEventListener('moviestars_state_updated', handleUpdate);
      window.removeEventListener('moviestars_auth_updated', handleUpdate);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setNavQuery(q);
    if (q.trim().length >= 2) {
      const results = searchCatalogAutocomplete(q, 6);
      setNavSuggestions(results);
      setIsNavDropdownOpen(true);
    } else {
      setNavSuggestions([]);
      setIsNavDropdownOpen(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navQuery.trim()) {
      setIsNavDropdownOpen(false);
      router.push(`/search?q=${encodeURIComponent(navQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Browse', href: '/browse' },
    { label: 'Search', href: '/search' },
    { label: 'Celebs', href: '/celebs' },
    { label: 'Upcoming', href: '/upcoming', beacon: true },
    { label: 'Top 250', href: '/top-rated' },
    { label: 'Categories', href: '/categories' },
    { label: 'Watchlist', href: '/watchlist', badge: watchlistCount },
  ];

  return (
    <>
      <header className="bg-surface-void/90 backdrop-blur-md border-b border-surface-border shadow-2xl shadow-surface-void/80 sticky top-0 z-40">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto h-16">
          {/* Brand & Search Inset Cluster */}
          <div className="flex items-center gap-4 md:gap-6 flex-1 max-w-xl">
            <Link className="flex items-center gap-2 group shrink-0" href="/">
              <span className="font-headline-md text-headline-md tracking-wider text-surface-void bg-amber-gold px-2.5 py-0.5 rounded flex items-center gap-1 transition-all duration-200 active:scale-95 group-hover:bg-amber-hover">
                MovieStars
                <span
                  className="material-symbols-outlined text-lg leading-none"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              </span>
            </Link>

            {/* Category Dropdown + Search Quick Trigger */}
            <div
              ref={searchContainerRef}
              className="hidden sm:flex relative items-center bg-surface-card border border-surface-border rounded px-2.5 py-1.5 flex-1 max-w-md focus-within:border-electric-violet focus-within:ring-2 focus-within:ring-electric-violet/20 transition-all"
            >
              {/* Category Dropdown Toggle */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="flex items-center gap-1 pr-2 border-r border-surface-border text-text-secondary text-xs font-semibold cursor-pointer hover:text-text-primary"
                >
                  <span>{selectedCategory}</span>
                  <span className="material-symbols-outlined text-sm">arrow_drop_down</span>
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-36 bg-surface-card border border-surface-border rounded shadow-2xl py-1 z-50">
                    {['All', 'Movies', 'TV Series', 'Categories'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setCategoryDropdownOpen(false);
                          if (cat === 'Categories') {
                            router.push('/categories');
                          } else if (cat === 'Movies') {
                            router.push('/browse?type=movie');
                          } else if (cat === 'TV Series') {
                            router.push('/browse?type=tv');
                          }
                        }}
                        className={cn(
                          'w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-surface-elevated transition-colors',
                          selectedCategory === cat ? 'text-amber-gold font-bold' : 'text-text-secondary'
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Search Input */}
              <form onSubmit={handleSearchSubmit} className="flex items-center w-full pl-2 gap-2">
                <span className="material-symbols-outlined text-text-muted text-base">search</span>
                <input
                  type="text"
                  value={navQuery}
                  onChange={handleQueryChange}
                  onFocus={() => {
                    if (navSuggestions.length > 0) setIsNavDropdownOpen(true);
                  }}
                  className="bg-transparent border-none p-0 text-xs text-text-primary focus:ring-0 w-full placeholder:text-text-muted focus:outline-none font-body-sm"
                  placeholder="Search movies, TV, stars..."
                />
                <kbd
                  onClick={() => setSearchOpen(true)}
                  className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-surface-elevated border border-surface-border rounded cursor-pointer hover:text-text-primary"
                  title="Press / or Ctrl+K to open advanced search"
                >
                  /
                </kbd>
              </form>

              {/* Autocomplete Dropdown */}
              {isNavDropdownOpen && navSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-card border border-surface-border rounded-lg shadow-2xl overflow-hidden z-50 divide-y divide-surface-border">
                  {navSuggestions.map((item) => (
                    <Link
                      key={item.id}
                      href={`/title/${item.id}`}
                      onClick={() => {
                        setIsNavDropdownOpen(false);
                        setNavQuery('');
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-surface-elevated transition-colors group"
                    >
                      <div className="relative w-8 h-12 bg-surface-elevated rounded overflow-hidden shrink-0">
                        <MovieImage
                          src={getTmdbImageUrl(item.posterPath, 'w185')}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-text-primary group-hover:text-amber-gold truncate">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-text-muted">
                          <span>{item.type === 'tv' || item.type === 'web_series' ? 'TV' : 'Movie'}</span>
                          <span>•</span>
                          <span>{item.releaseDate?.slice(0, 4)}</span>
                          <span>•</span>
                          <span className="text-amber-gold font-bold">★ {item.ratings.imdb?.score?.toFixed(1) || '8.5'}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <div className="p-2 bg-surface-void text-center">
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="text-xs font-semibold text-amber-gold hover:underline"
                    >
                      View all results for &ldquo;{navQuery}&rdquo; →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 px-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'font-label-md text-label-md flex items-center gap-1.5 transition-colors relative',
                    isActive
                      ? 'text-amber-gold font-bold'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  <span>{link.label}</span>
                  {link.beacon && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-violet opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-electric-violet" />
                    </span>
                  )}
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="bg-amber-gold text-surface-void font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Trailing Action Cluster */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle (Dark / Light Mode) */}
            <ThemeToggle />

            {/* User Auth or Sign In Button */}
            {authUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href={authUser.role === 'admin' ? '/admin' : '/watchlist'}
                  className="bg-surface-elevated hover:border-amber-gold/50 text-text-primary border border-surface-border font-label-md text-label-md px-3 py-1.5 rounded flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-amber-gold text-sm">person</span>
                  <span className="max-w-[80px] truncate">{authUser.name || 'Account'}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('moviestars_auth_user');
                    localStorage.removeItem('moviestars_token');
                    setAuthUser(null);
                    window.dispatchEvent(new Event('moviestars_auth_updated'));
                  }}
                  title="Sign Out"
                  className="p-1.5 text-text-muted hover:text-red-400 rounded hover:bg-surface-card transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-amber-gold text-surface-void hover:bg-amber-hover font-bold font-label-md text-label-md px-3.5 py-1.5 rounded transition-all duration-200 active:scale-95 glow-gold shadow-md flex items-center gap-1"
              >
                <span
                  className="material-symbols-outlined text-sm font-bold"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  account_circle
                </span>
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Action */}
            <button
              type="button"
              onClick={() => setMenuDrawerOpen(!menuDrawerOpen)}
              aria-label="Toggle Navigation"
              className="md:hidden text-text-secondary hover:text-text-primary p-1.5 focus:outline-none"
            >
              <span className="material-symbols-outlined text-2xl">
                {menuDrawerOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {menuDrawerOpen && (
          <div className="md:hidden border-t border-surface-border bg-surface-card px-4 py-4 space-y-3">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuDrawerOpen(false)}
                  className={cn(
                    'flex items-center justify-between py-2 text-sm font-semibold rounded px-2',
                    pathname === link.href ? 'bg-amber-gold/15 text-amber-gold' : 'text-text-secondary hover:bg-surface-elevated'
                  )}
                >
                  <span>{link.label}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="bg-amber-gold text-surface-void font-bold text-xs px-2 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Global Advanced Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
