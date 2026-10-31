'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { MovieImage } from '@/components/MovieImage';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ALL_CELEBRITIES, getBornTodayCelebrities, DetailedCelebrity } from '@/lib/data/celebrities';
import { COUNTRIES } from '@/lib/data/mockMovies';
import { cn, getTmdbImageUrl } from '@/lib/utils';

function CelebsContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'Actor' | 'Actress' | 'Director'>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'trending' | 'name' | 'age'>('trending');

  const bornToday = useMemo(() => getBornTodayCelebrities(), []);

  const filteredCelebrities = useMemo(() => {
    let list = [...ALL_CELEBRITIES];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.birthPlace.toLowerCase().includes(q) ||
          c.topTitles.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedRole !== 'all') {
      list = list.filter((c) => c.role === selectedRole);
    }

    if (selectedCountry !== 'all') {
      list = list.filter((c) => c.originCountry.toUpperCase() === selectedCountry.toUpperCase());
    }

    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'age') {
      list.sort((a, b) => (b.age || 0) - (a.age || 0));
    } else {
      list.sort((a, b) => a.trendingRank - b.trendingRank);
    }

    return list;
  }, [searchQuery, selectedRole, selectedCountry, sortBy]);

  const roles = [
    { id: 'all', label: 'All Stars' },
    { id: 'Actor', label: 'Actors' },
    { id: 'Actress', label: 'Actresses' },
    { id: 'Director', label: 'Directors' },
  ];

  const countryFilterOptions = [
    { code: 'all', name: 'All World', flag: '🌐' },
    ...COUNTRIES,
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Celebrities & Stars' }]} />

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-card via-surface-card to-surface-elevated border border-surface-border p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-gold/10 border border-amber-gold/20 text-amber-gold text-xs font-bold tracking-widest uppercase">
            <span className="material-symbols-outlined text-sm">stars</span>
            Global Cinema Stars & Creators
          </div>
          <h1 className="font-headline-md text-4xl sm:text-6xl text-text-primary tracking-wide">
            CELEBRITIES & <span className="text-amber-gold">STARS DIRECTORY</span>
          </h1>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            Explore the titans of world cinema across Hollywood, Indian Cinema (Bollywood & South),
            the Korean Wave, Japanese Cinema, and European Masters. Discover comprehensive biographic
            profiles, birth dates, award histories, and direct streaming links for every title in their
            filmography.
          </p>
        </div>
      </div>

      {/* Born Today Carousel */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-gold/10 text-amber-gold material-symbols-outlined text-xl">
              cake
            </span>
            <div>
              <h2 className="font-headline-sm text-2xl text-text-primary tracking-wide">
                BORN TODAY & THIS MONTH
              </h2>
              <p className="text-text-muted text-xs">
                Celebrating icons born around this time of year
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-amber-gold bg-amber-gold/10 border border-amber-gold/20 px-2.5 py-1 rounded">
            {bornToday.length} Icons
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {bornToday.map((star) => (
            <Link
              key={star.id}
              href={`/person/${star.id}`}
              className="group relative flex flex-col bg-surface-card border border-surface-border rounded-2xl overflow-hidden hover:border-amber-gold/50 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl"
            >
              <div className="relative aspect-[3/4] w-full bg-surface-elevated overflow-hidden">
                <MovieImage
                  src={star.profilePath ? getTmdbImageUrl(star.profilePath, 'w500') : '/avatar-placeholder.png'}
                  alt={star.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-void/90 via-surface-void/20 to-transparent" />
                <div className="absolute top-2 right-2 bg-amber-gold text-surface-void text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                  Age {star.age}
                </div>
              </div>
              <div className="p-3 space-y-1">
                <h3 className="font-bold text-xs text-text-primary group-hover:text-amber-gold truncate">
                  {star.name}
                </h3>
                <p className="text-[10px] text-text-muted truncate">
                  {star.role} • {star.birthPlace.split(',').pop()?.trim()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="space-y-4 bg-surface-card border border-surface-border rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Live Search */}
          <div className="relative w-full md:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search star by name, country, or top film..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-surface-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs text-text-muted font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-surface-elevated border border-surface-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-amber-gold"
            >
              <option value="trending">Most Popular & Trending</option>
              <option value="name">Name (A to Z)</option>
              <option value="age">Age (Seniority)</option>
            </select>
          </div>
        </div>

        {/* Role Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-surface-border">
          <span className="text-xs text-text-muted font-medium mr-2">Profession:</span>
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRole(r.id as any)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                selectedRole === r.id
                  ? 'bg-amber-gold text-surface-void font-bold shadow-md shadow-amber-gold/20'
                  : 'bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-surface-border'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Country Filter Rail */}
        <div className="flex items-center gap-2 pt-2 border-t border-surface-border overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs text-text-muted font-medium mr-2 shrink-0">Industry:</span>
          {countryFilterOptions.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setSelectedCountry(c.code)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all',
                selectedCountry === c.code
                  ? 'bg-amber-gold/20 text-amber-gold border border-amber-gold/40 font-bold'
                  : 'bg-surface-elevated text-text-secondary border border-surface-border hover:text-text-primary'
              )}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Celebrities Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-2xl text-text-primary tracking-wide">
            POPULAR CELEBRITIES ({filteredCelebrities.length})
          </h2>
          <span className="text-xs text-text-muted">
            Showing verified profiles with full filmographies
          </span>
        </div>

        {filteredCelebrities.length === 0 ? (
          <div className="text-center py-16 bg-surface-card border border-surface-border rounded-2xl space-y-4">
            <span className="material-symbols-outlined text-5xl text-text-muted">person_off</span>
            <h3 className="text-lg font-bold text-text-primary">No stars found</h3>
            <p className="text-text-muted text-xs max-w-sm mx-auto">
              No celebrity matched your filter &ldquo;{searchQuery}&rdquo;. Try resetting the search or filter tags.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedRole('all');
                setSelectedCountry('all');
              }}
              className="px-4 py-2 bg-amber-gold text-surface-void font-bold text-xs rounded-lg hover:bg-amber-hover transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCelebrities.map((star) => (
              <div
                key={star.id}
                className="group relative bg-surface-card border border-surface-border rounded-2xl overflow-hidden hover:border-amber-gold/50 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl flex flex-col justify-between"
              >
                <div className="p-5 flex gap-4">
                  {/* Portrait */}
                  <Link
                    href={`/person/${star.id}`}
                    className="relative w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden bg-surface-elevated shrink-0 border border-surface-border group-hover:border-amber-gold/40 transition-colors"
                  >
                    <MovieImage
                      src={star.profilePath ? getTmdbImageUrl(star.profilePath, 'w500') : '/avatar-placeholder.png'}
                      alt={star.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-1 left-1 bg-surface-void/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-gold font-bold">
                      #{star.trendingRank}
                    </div>
                  </Link>

                  {/* Info Cluster */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-elevated text-amber-gold border border-surface-border uppercase tracking-wide">
                        {star.role}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        Age {star.age}
                      </span>
                    </div>

                    <Link href={`/person/${star.id}`}>
                      <h3 className="font-headline-sm text-xl text-text-primary group-hover:text-amber-gold transition-colors truncate">
                        {star.name}
                      </h3>
                    </Link>

                    <p className="text-[11px] text-text-muted line-clamp-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      {star.birthPlace}
                    </p>

                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed pt-1">
                      {star.bio}
                    </p>
                  </div>
                </div>

                {/* Bottom Known For & Action Rail */}
                <div className="px-5 pb-5 pt-3 border-t border-surface-border/60 bg-surface-elevated/40 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-muted block mb-1">
                      Notable Works:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {star.topTitles.slice(0, 3).map((title) => (
                        <span
                          key={title}
                          className="text-[11px] px-2 py-0.5 rounded bg-surface-elevated border border-surface-border text-text-secondary"
                        >
                          {title}
                        </span>
                      ))}
                      {star.topTitles.length > 3 && (
                        <span className="text-[10px] text-text-muted self-center">
                          +{star.topTitles.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-amber-gold font-medium truncate max-w-[200px]" title={star.awards}>
                      🏆 {star.awards.split(',')[0]}
                    </span>
                    <Link
                      href={`/person/${star.id}`}
                      className="text-xs font-bold text-amber-gold hover:text-amber-hover flex items-center gap-1 group/btn"
                    >
                      <span>Filmography</span>
                      <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function CelebsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-amber-gold/20 border-t-amber-gold rounded-full animate-spin" />
        </div>
      }
    >
      <CelebsContent />
    </Suspense>
  );
}

