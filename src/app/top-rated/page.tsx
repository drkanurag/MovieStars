'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MovieImage } from '@/components/MovieImage';
import { getBestOfAllTime } from '@/lib/api/movieStore';
import { scoreToStars, DEFAULT_MIN_VOTES, DEFAULT_GLOBAL_MEAN } from '@/lib/bayesian';
import { Trophy, Award, Star, Info, ExternalLink, Sparkles, Medal, Plus, Check, Filter, Globe } from 'lucide-react';
import { getTmdbImageUrl, formatVoteCount } from '@/lib/utils';
import { getClientState, toggleListStatus, getSelectedCountry } from '@/lib/storage';
import { COUNTRIES, getCountryByCode } from '@/lib/data/mockMovies';
import { cn } from '@/lib/utils';
import { TitleItem } from '@/types/movie';

export default function BestOfAllTimePage() {
  const allTitles = getBestOfAllTime();
  const [selectedType, setSelectedType] = useState<'all' | 'movie' | 'tv' | 'web_series'>('all');
  const [selectedCountry, setSelectedCountryFilter] = useState<string>('all');
  const [activeCountry, setActiveCountry] = useState<string>('IN');
  const [sortBy, setSortBy] = useState<'bayesian' | 'imdb' | 'votes' | 'year'>('bayesian');
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);

  useEffect(() => {
    document.title = 'IMDb Top 250 & Best of All Time Movies — Bayesian Rankings | MovieStars';
    const s = getClientState();
    setWatchlistIds(s.watchlist);
    setActiveCountry(getSelectedCountry());

    const handleUpdate = () => {
      const state = getClientState();
      setWatchlistIds(state.watchlist);
    };

    const handleCountryUpdate = () => {
      setActiveCountry(getSelectedCountry());
    };

    window.addEventListener('moviestars_state_updated', handleUpdate);
    window.addEventListener('moviestars_country_updated', handleCountryUpdate);
    return () => {
      window.removeEventListener('moviestars_state_updated', handleUpdate);
      window.removeEventListener('moviestars_country_updated', handleCountryUpdate);
    };
  }, []);

  const handleWatchlistToggle = (e: React.MouseEvent, titleId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleListStatus(titleId, 'watchlist');
  };

  // Filter
  let filtered = allTitles.filter((t) => {
    if (selectedType !== 'all' && t.type !== selectedType) return false;
    if (selectedCountry !== 'all' && t.originCountry?.toUpperCase() !== selectedCountry.toUpperCase()) return false;
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'imdb') {
      const aScore = a.ratings.imdb?.score ?? a.ratings.tmdb?.score ?? a.ratings.bayesianScore;
      const bScore = b.ratings.imdb?.score ?? b.ratings.tmdb?.score ?? b.ratings.bayesianScore;
      return bScore - aScore;
    }
    if (sortBy === 'votes') {
      const aVotes = a.ratings.imdb?.votes ?? a.ratings.tmdb?.votes ?? 0;
      const bVotes = b.ratings.imdb?.votes ?? b.ratings.tmdb?.votes ?? 0;
      return bVotes - aVotes;
    }
    if (sortBy === 'year') return (b.releaseDate || '').localeCompare(a.releaseDate || '');
    return b.ratings.bayesianScore - a.ratings.bayesianScore;
  });

  return (
    <div className="space-y-8">
      {/* 1. Header with Golden Trophy & Transparency callout */}
      <div className="space-y-5 border-b border-white/10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-[#f5c518] text-black shadow-lg shadow-amber-500/25">
              <Trophy className="w-8 h-8 fill-black" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                IMDb Top 250 & <span className="text-[#f5c518]">Best of All Time</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                The world’s top-rated cinema and series, ranked mathematically using the Bayesian Top 250 weighted formula
              </p>
            </div>
          </div>
        </div>

        {/* Mathematical Formula Callout */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#1a1a1a] border border-[#f5c518]/30 text-xs text-zinc-300 space-y-2.5 shadow-xl">
          <div className="flex items-center gap-2 font-black text-[#f5c518]">
            <Sparkles className="w-4 h-4" />
            <span>Why raw average ratings fail:</span>
          </div>
          <p className="text-zinc-400 leading-relaxed text-xs">
            Sorting by raw stars allows an obscure indie title with only 3 votes of 5.0 to outrank global masterpieces like
            <em> The Godfather</em>. To maintain mathematical fairness, we calculate the Bayesian weighted mean:
          </p>
          <div className="p-2.5 rounded-xl bg-black border border-white/10 font-mono text-emerald-400 text-xs overflow-x-auto">
            W = (v / (v + m)) × R + (m / (v + m)) × C
          </div>
          <p className="text-[11px] text-zinc-400 font-medium">
            Where <strong>R</strong> = title&apos;s arithmetic mean score, <strong>v</strong> = total votes,{' '}
            <strong>m</strong> = minimum threshold ({DEFAULT_MIN_VOTES.toLocaleString()} votes), and{' '}
            <strong>C</strong> = catalog average score ({DEFAULT_GLOBAL_MEAN}/10).
          </p>
        </div>
      </div>

      {/* 2. Interactive Country & Type Filters */}
      <div className="space-y-3">
        {/* Country Filter Carousel Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { code: 'all', label: '🌍 All World Cinema' },
            { code: 'IN', label: '🇮🇳 Indian Cinema' },
            { code: 'US', label: '🇺🇸 Hollywood (USA)' },
            { code: 'JP', label: '🇯🇵 Japanese Cinema' },
            { code: 'KR', label: '🇰🇷 Korean Cinema' },
            { code: 'GB', label: '🇬🇧 British Cinema' },
            { code: 'FR', label: '🇫🇷 French Cinema' },
            { code: 'ES', label: '🇪🇸 Spanish Cinema' },
            { code: 'DE', label: '🇩🇪 German Cinema' },
            { code: 'IT', label: '🇮🇹 Italian Cinema' },
            { code: 'BR', label: '🇧🇷 Brazilian Cinema' },
          ].map((c) => (
            <button
              key={c.code}
              onClick={() => setSelectedCountryFilter(c.code)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0',
                selectedCountry === c.code
                  ? 'bg-[#f5c518] text-black shadow-md shadow-amber-500/20 scale-105'
                  : 'bg-[#1a1a1a] text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Type & Sorter Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#1a1a1a] border border-white/10">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Formats' },
              { id: 'movie', label: 'Feature Films' },
              { id: 'tv', label: 'TV Shows' },
              { id: 'web_series', label: 'Web Series' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedType(cat.id as any)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                  selectedType === cat.id
                    ? 'bg-zinc-200 text-black shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400 font-bold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-white font-bold outline-none cursor-pointer"
            >
              <option value="bayesian">Ranking (Bayesian)</option>
              <option value="imdb">IMDb Rating</option>
              <option value="votes">Number of Ratings</option>
              <option value="year">Release Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Ranked Chart List View (IMDb Style) */}
      <div className="space-y-3">
        {filtered.map((title, index) => {
          const rank = index + 1;
          const stars = scoreToStars(title.ratings.bayesianScore);
          const inAvailability = title.availability[activeCountry] || title.availability['IN'];
          const streamingOffers = inAvailability?.stream || [];
          const inWatchlist = watchlistIds.includes(title.id);

          return (
            <div
              key={title.id}
              className={cn(
                'p-4 sm:p-5 rounded-2xl bg-[#1a1a1a] border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:shadow-2xl hover:-translate-y-0.5',
                rank === 1
                  ? 'border-amber-400/50 bg-gradient-to-r from-amber-500/10 via-[#1a1a1a] to-[#1a1a1a]'
                  : rank === 2
                  ? 'border-slate-300/40 bg-gradient-to-r from-slate-400/10 via-[#1a1a1a] to-[#1a1a1a]'
                  : rank === 3
                  ? 'border-amber-700/40 bg-gradient-to-r from-amber-800/10 via-[#1a1a1a] to-[#1a1a1a]'
                  : 'border-white/10 hover:border-[#f5c518]/60'
              )}
            >
              {/* Left Column: Rank + Poster with Ribbon + Info */}
              <div className="flex items-center gap-4 min-w-0">
                {/* Rank Medal / Number */}
                <div className="w-10 sm:w-12 text-center shrink-0">
                  {rank === 1 ? (
                    <div className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-br from-amber-300 via-[#f5c518] to-amber-600 flex items-center justify-center font-black text-black text-sm shadow-lg shadow-amber-500/30">
                      #1
                    </div>
                  ) : rank === 2 ? (
                    <div className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 flex items-center justify-center font-black text-black text-sm shadow-md">
                      #2
                    </div>
                  ) : rank === 3 ? (
                    <div className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 flex items-center justify-center font-black text-amber-200 text-sm shadow-md">
                      #3
                    </div>
                  ) : (
                    <span className="font-black text-lg text-zinc-500">#{rank}</span>
                  )}
                </div>

                {/* Poster Thumbnail with Watchlist Bookmark Ribbon */}
                <div className="relative w-16 h-24 sm:w-20 sm:h-28 rounded-2xl overflow-hidden bg-black shrink-0 border border-white/10 shadow-md group-hover:scale-105 transition-transform">
                  <MovieImage
                    src={getTmdbImageUrl(title.posterPath, 'w300')}
                    alt={title.title}
                    fill
                    className="object-cover"
                  />

                  {/* Bookmark Ribbon */}
                  <button
                    onClick={(e) => handleWatchlistToggle(e, title.id)}
                    className="absolute top-0 left-1.5 z-20 group/ribbon focus:outline-none"
                    title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    <div
                      className={cn(
                        'relative w-6 h-8 flex items-center justify-center transition-all duration-300 drop-shadow-md',
                        inWatchlist
                          ? 'text-[#f5c518] scale-105'
                          : 'text-black/75 hover:text-black/90'
                      )}
                    >
                      <svg viewBox="0 0 32 42" className="w-full h-full fill-current">
                        <path d="M0 0h32v42l-16-10-16 10V0z" />
                      </svg>
                      <div className="absolute top-1 inset-x-0 flex items-center justify-center">
                        {inWatchlist ? (
                          <Check className="w-3 h-3 text-black stroke-[3.5]" />
                        ) : (
                          <Plus className="w-3 h-3 text-white stroke-[3] group-hover/ribbon:scale-125 transition-transform" />
                        )}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Title & Metadata */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/title/${title.id}`}>
                      <h3 className="font-extrabold text-white text-base sm:text-xl group-hover:text-[#f5c518] transition-colors truncate">
                        {title.title}
                      </h3>
                    </Link>
                    {title.metascore && (
                      <span
                        className={cn(
                          'px-1.5 py-0.5 rounded text-[10px] font-black text-white shrink-0',
                          title.metascore >= 80 ? 'bg-emerald-600' : 'bg-amber-600'
                        )}
                      >
                        {title.metascore}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-zinc-400 font-semibold">
                    {title.originCountry && (
                      <>
                        <span className="px-2 py-0.5 rounded-lg bg-zinc-800 border border-white/10 text-white font-bold inline-flex items-center gap-1.5 shadow-sm">
                          <span>{getCountryByCode(title.originCountry).flag}</span>
                          <span>{getCountryByCode(title.originCountry).name}</span>
                        </span>
                        <span className="text-zinc-600">•</span>
                      </>
                    )}
                    <span>{title.releaseDate ? title.releaseDate.slice(0, 4) : 'TBA'}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="capitalize text-zinc-300">{title.type.replace('_', ' ')}</span>
                    <span className="text-zinc-600">•</span>
                    <span>
                      {title.runtimeMinutes ? `${title.runtimeMinutes}m` : `${title.seasonsCount} Seasons`}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400">{title.genres.map((g) => g.name).join(', ')}</span>
                  </div>

                  {/* Summary / What It's About */}
                  <p className="text-xs text-zinc-300/90 line-clamp-2 mt-1.5 leading-relaxed max-w-2xl font-normal">
                    {title.overview}
                  </p>

                  {/* Streaming Availability Badges */}
                  <div className="flex items-center gap-1.5 mt-2.5 overflow-hidden">
                    <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider">
                      Stream in {getCountryByCode(activeCountry).name} {getCountryByCode(activeCountry).flag}:
                    </span>
                    {streamingOffers.length > 0 ? (
                      streamingOffers.slice(0, 3).map((offer, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-zinc-900 border border-white/10 text-[10px] text-zinc-200 font-semibold"
                        >
                          {offer.provider.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-zinc-500 italic">In Theaters / VOD</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Score Progress & Bayesian Breakdown */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-white/10">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-[#f5c518] font-black text-xl">
                    <Star className="w-5 h-5 fill-[#f5c518] text-[#f5c518]" />
                    <span>{(title.ratings.imdb?.score ?? title.ratings.tmdb?.score ?? title.ratings.bayesianScore).toFixed(1)}</span>
                    <span className="text-xs text-zinc-500 font-medium">/10</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-medium">
                    Bayesian Weighted: <strong>{title.ratings.bayesianScore}</strong>/10
                  </div>
                </div>

                <div className="text-right text-[11px] text-zinc-400 font-medium">
                  {title.ratings.imdb ? (
                    <>Based on <strong>{formatVoteCount(title.ratings.imdb.votes)}</strong> IMDb votes</>
                  ) : title.ratings.tmdb ? (
                    <>Based on <strong>{formatVoteCount(title.ratings.tmdb.votes)}</strong> TMDB votes</>
                  ) : (
                    <>Global Bayesian Score</>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
