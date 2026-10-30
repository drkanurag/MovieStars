'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getCatalog } from '@/lib/api/movieStore';
import { MovieCard } from '@/components/MovieCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { getTmdbImageUrl } from '@/lib/utils';
import { User, Film, Star, Award, Clapperboard, Calendar, Sparkles } from 'lucide-react';
import { CELEBRITIES_BORN_TODAY } from '@/lib/data/mockMovies';

export default function PersonPage() {
  const params = useParams();
  const rawId = params?.id as string;
  const catalog = getCatalog();

  // Find all titles where this person is in cast or directors
  const matchingTitles = catalog.filter((movie) => {
    const inCast = movie.cast.some(
      (c) => String(c.id) === rawId || c.name.toLowerCase().replace(/\s+/g, '-') === rawId
    );
    const inDir = movie.directors.some(
      (d) => String(d.id) === rawId || d.name.toLowerCase().replace(/\s+/g, '-') === rawId
    );
    return inCast || inDir;
  });

  // Check if this person is in our celebrity spotlight roster
  const celebMatch = CELEBRITIES_BORN_TODAY.find(
    (c) => String(c.id) === rawId || c.name.toLowerCase().replace(/\s+/g, '-') === rawId
  );

  // Extract person details from matching titles or celebrity roster
  let personName = decodeURIComponent(rawId).replace(/-/g, ' ');
  let profilePath: string | undefined = celebMatch?.profilePath;
  let department = celebMatch?.role || 'Acting & Directing';
  let age = celebMatch?.age;
  let birthDate = celebMatch?.birthDate;
  let knownFor = celebMatch?.knownFor;

  if (matchingTitles.length > 0) {
    const movie = matchingTitles[0];
    const castMember = movie.cast.find(
      (c) => String(c.id) === rawId || c.name.toLowerCase().replace(/\s+/g, '-') === rawId
    );
    const dirMember = movie.directors.find(
      (d) => String(d.id) === rawId || d.name.toLowerCase().replace(/\s+/g, '-') === rawId
    );

    if (castMember) {
      personName = castMember.name;
      if (!profilePath) profilePath = castMember.profilePath;
      if (!department) department = 'Acting';
    } else if (dirMember) {
      personName = dirMember.name;
      if (!department) department = 'Directing';
    }
  }

  useEffect(() => {
    document.title = `${personName} — Filmography, Bio & Top Ratings | MovieStars`;
  }, [personName]);

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: personName,
    jobTitle: department,
    image: profilePath,
  };

  return (
    <div className="space-y-8">
      {/* Schema.org Person JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Browse', href: '/browse' },
          { label: personName },
        ]}
      />

      {/* IMDb-Style Person Profile Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#1a1a1a] border border-white/10 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 shadow-xl">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden bg-black border-2 border-white/15 shadow-xl shrink-0">
          {profilePath ? (
            <Image
              src={getTmdbImageUrl(profilePath, 'w500')}
              alt={personName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-black text-4xl text-[#f5c518] bg-zinc-900">
              {personName[0]}
            </div>
          )}
        </div>

        <div className="space-y-3 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="px-3 py-1 rounded-full bg-[#f5c518]/20 border border-[#f5c518]/40 text-[#f5c518] text-xs font-black uppercase">
              {department}
            </span>
            {age && (
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-xs font-bold">
                {age} years old
              </span>
            )}
            <span className="text-xs text-zinc-400">
              {matchingTitles.length} Titles in MovieStars Master Catalog
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {personName}
          </h1>

          {knownFor && (
            <p className="text-xs sm:text-sm text-[#f5c518] font-semibold">
              Known for: {knownFor}
            </p>
          )}

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
            Celebrated cinema personality known for distinctive performances, world-class directorial vision,
            and critically acclaimed works featured across international film festivals and global streaming leaderboards.
          </p>
        </div>
      </div>

      {/* Filmography Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 rounded-full bg-[#f5c518]" />
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Clapperboard className="w-5 h-5 text-[#f5c518]" />
              Filmography & Credits
            </h2>
          </div>
          <span className="text-xs text-zinc-400">
            Ranked by Bayesian Weighted Score
          </span>
        </div>

        {matchingTitles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
            {matchingTitles.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-400 text-xs p-8 rounded-2xl bg-[#1a1a1a] border border-white/10">
            No credits listed for this person in the current local sample.
          </div>
        )}
      </div>
    </div>
  );
}
