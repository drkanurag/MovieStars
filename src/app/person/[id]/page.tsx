'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getCatalog } from '@/lib/api/movieStore';
import { MovieCard } from '@/components/MovieCard';
import { MovieImage } from '@/components/MovieImage';
import { Breadcrumb } from '@/components/Breadcrumb';
import { getCelebrityById, ALL_CELEBRITIES } from '@/lib/data/celebrities';
import { getTmdbImageUrl } from '@/lib/utils';
import { Clapperboard, Award, Calendar, MapPin, Star, User, Film } from 'lucide-react';

export default function PersonPage() {
  const params = useParams();
  const rawId = (params?.id as string) || '';
  const catalog = getCatalog();

  // 1. Check if person exists in curated detailed celebrities roster
  const celeb = useMemo(() => getCelebrityById(rawId), [rawId]);

  // 2. Find all matching titles in the catalog where person is in cast or directors
  const matchingTitles = useMemo(() => {
    const norm = rawId.toLowerCase().replace(/\s+/g, '-');
    return catalog.filter((movie) => {
      const inCast = movie.cast.some(
        (c) =>
          String(c.id).toLowerCase() === norm ||
          c.name.toLowerCase().replace(/\s+/g, '-') === norm ||
          (celeb && c.name.toLowerCase() === celeb.name.toLowerCase())
      );
      const inDir = movie.directors.some(
        (d) =>
          String(d.id).toLowerCase() === norm ||
          d.name.toLowerCase().replace(/\s+/g, '-') === norm ||
          (celeb && d.name.toLowerCase() === celeb.name.toLowerCase())
      );
      return inCast || inDir;
    });
  }, [rawId, catalog, celeb]);

  // 3. Fallback resolution for any of the 558+ cast members and 199+ directors in catalog
  let personName = celeb?.name || decodeURIComponent(rawId).replace(/-/g, ' ');
  let profilePath: string | undefined = celeb?.profilePath;
  let role = celeb?.role || 'Actor';
  let age = celeb?.age;
  let birthDate = celeb?.birthDate;
  let birthPlace = celeb?.birthPlace;
  let awards = celeb?.awards;
  let bio = celeb?.bio;

  if (!celeb && matchingTitles.length > 0) {
    const movie = matchingTitles[0];
    const castMember = movie.cast.find(
      (c) =>
        String(c.id).toLowerCase() === rawId.toLowerCase() ||
        c.name.toLowerCase().replace(/\s+/g, '-') === rawId.toLowerCase()
    );
    const dirMember = movie.directors.find(
      (d) =>
        String(d.id).toLowerCase() === rawId.toLowerCase() ||
        d.name.toLowerCase().replace(/\s+/g, '-') === rawId.toLowerCase()
    );

    if (castMember) {
      personName = castMember.name;
      if (!profilePath) profilePath = castMember.profilePath;
      role = 'Actor';
    } else if (dirMember) {
      personName = dirMember.name;
      role = 'Director';
    }
  }

  useEffect(() => {
    document.title = `${personName} — Filmography, Bio & Ratings | MovieStars`;
  }, [personName]);

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: personName,
    jobTitle: role,
    image: profilePath,
    birthDate: birthDate,
    birthPlace: birthPlace,
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Schema.org Person JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Celebrities', href: '/celebs' },
          { label: personName },
        ]}
      />

      {/* Profile Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-card border border-surface-border p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
          {/* Portrait Image */}
          <div className="relative w-40 h-52 sm:w-52 sm:h-68 rounded-2xl overflow-hidden bg-surface-elevated border-2 border-surface-border shadow-2xl shrink-0">
            {profilePath ? (
              <MovieImage
                src={getTmdbImageUrl(profilePath, 'w500')}
                alt={personName}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-headline-md text-6xl text-amber-gold bg-surface-elevated">
                {personName[0]}
              </div>
            )}
            {celeb?.trendingRank && (
              <div className="absolute top-2 left-2 bg-surface-void/90 backdrop-blur-md px-2 py-0.5 rounded text-xs font-mono text-amber-gold font-bold border border-amber-gold/30">
                #{celeb.trendingRank} Trending
              </div>
            )}
          </div>

          {/* Profile Bio & Details */}
          <div className="space-y-4 text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-gold/15 border border-amber-gold/30 text-amber-gold text-xs font-bold uppercase tracking-wider">
                {role}
              </span>
              {age && (
                <span className="px-3 py-1 rounded-full bg-surface-elevated text-text-secondary border border-surface-border text-xs font-medium">
                  {age} Years Old
                </span>
              )}
              {birthDate && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-elevated text-text-secondary border border-surface-border text-xs font-medium">
                  <Calendar className="w-3.5 h-3.5 text-amber-gold" />
                  {birthDate}
                </span>
              )}
              {birthPlace && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-elevated text-text-secondary border border-surface-border text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-amber-gold" />
                  {birthPlace}
                </span>
              )}
            </div>

            <h1 className="font-headline-md text-4xl sm:text-6xl text-text-primary tracking-wide">
              {personName}
            </h1>

            {awards && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-gold font-semibold justify-center sm:justify-start">
                <Award className="w-4 h-4 shrink-0" />
                <span>{awards}</span>
              </div>
            )}

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-3xl">
              {bio ||
                `${personName} is an internationally acclaimed cinema talent known for versatile storytelling, captivating character depth, and box-office authority across global streaming networks and festival selections.`}
            </p>

            {celeb?.topTitles && celeb.topTitles.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider block mb-2">
                  Notable Masterpieces:
                </span>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {celeb.topTitles.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-lg bg-surface-elevated border border-surface-border text-text-primary text-xs font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filmography Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-gold/10 text-amber-gold material-symbols-outlined text-2xl">
              movie
            </span>
            <div>
              <h2 className="font-headline-sm text-2xl sm:text-3xl text-text-primary tracking-wide">
                FILMOGRAPHY & CREDITS
              </h2>
              <p className="text-xs text-text-muted">
                Titles featuring {personName} in the MovieStars Global Catalog
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-amber-gold bg-amber-gold/10 border border-amber-gold/20 px-3 py-1 rounded-lg">
            {matchingTitles.length} Available Titles
          </span>
        </div>

        {matchingTitles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {matchingTitles.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-card border border-surface-border rounded-2xl space-y-4">
            <Film className="w-12 h-12 text-text-muted mx-auto" />
            <h3 className="text-lg font-bold text-text-primary">
              Full Masterworks on Standby
            </h3>
            <p className="text-text-muted text-xs max-w-md mx-auto">
              {personName}&apos;s catalog is indexed in our worldwide system. Browse all categories and
              streaming availability across global providers.
            </p>
            <Link
              href="/browse"
              className="inline-block px-5 py-2.5 bg-amber-gold text-surface-void font-bold text-xs rounded-xl hover:bg-amber-hover transition-colors shadow-lg shadow-amber-gold/20"
            >
              Explore Worldwide Catalog
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
