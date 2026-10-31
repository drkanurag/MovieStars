'use client';

import React, { useState } from 'react';
import { RatingBreakdown } from '@/types/movie';
import { explainBayesianRank, scoreToStars } from '@/lib/bayesian';
import { Award, Info, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingBadgeProps {
  ratings: RatingBreakdown;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export function RatingBadge({
  ratings,
  size = 'md',
  showDetails = false,
  className,
}: RatingBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const bayesianStars = scoreToStars(ratings.bayesianScore);
  const imdbVotes = ratings.imdb?.votes ?? 0;
  const imdbScore = ratings.imdb?.score ?? ratings.bayesianScore;
  const explanation = explainBayesianRank(imdbVotes, imdbScore);

  return (
    <div className={cn('relative inline-flex flex-wrap items-center gap-2.5', className)}>
      {/* Primary Bayesian Weighted Score Card */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 border border-amber-400/40 text-cinema-gold font-black cursor-help group transition-all hover:bg-amber-500/25 shadow-md shadow-amber-500/10"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        <Award className="w-4 h-4 text-cinema-gold drop-shadow-[0_0_6px_rgba(245,197,24,0.6)]" />
        <span className="text-sm font-extrabold tracking-tight">{bayesianStars.toFixed(1)}</span>
        <span className="text-[10px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded-md bg-cinema-gold text-black">
          Rank Score
        </span>
        <Info className="w-3.5 h-3.5 text-zinc-400 group-hover:text-cinema-gold ml-0.5 transition-colors" />
      </div>

      {/* Tooltip explaining Bayesian rating formula */}
      {showTooltip && (
        <div className="absolute top-full left-0 mt-2 z-50 w-80 p-4 glass-panel-elevated rounded-2xl shadow-2xl text-xs text-zinc-300 backdrop-blur-2xl border border-amber-400/30 animate-fadeIn">
          <div className="flex items-center gap-2 text-cinema-gold font-extrabold mb-1.5">
            <Award className="w-4 h-4" />
            <span>Bayesian Weighted Score: {ratings.bayesianScore} / 10</span>
          </div>
          <p className="text-zinc-400 leading-relaxed mb-2 text-[11px]">
            Uses the official IMDb Top 250 weighted ranking formula:
            <code className="block my-2 p-2 bg-black/70 text-[11px] rounded-lg text-emerald-400 font-mono border border-emerald-500/20">
              W = (v / (v + m)) × R + (m / (v + m)) × C
            </code>
          </p>
          <p className="text-zinc-300 text-[11px] leading-relaxed">{explanation.explanation}</p>
        </div>
      )}

      {/* Multi-Source Badges Row */}
      {showDetails && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* IMDb badge */}
          {ratings.imdb && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f5c518] text-black font-black shadow-sm" title="IMDb Rating">
              <span className="tracking-tighter">IMDb</span>
              <span className="font-extrabold">{ratings.imdb.score.toFixed(1)}</span>
            </div>
          )}

          {/* TMDB badge */}
          {ratings.tmdb && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold shadow-sm" title="TMDB Community Score">
              <span>TMDB</span>
              <span>{ratings.tmdb.score.toFixed(1)}</span>
            </div>
          )}

          {/* Community user rating */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-pill text-zinc-200 font-bold" title="MovieStars Community Rating">
            <Star className="w-3.5 h-3.5 fill-cinema-gold text-cinema-gold" />
            <span>{ratings.userCommunity.score.toFixed(1)}/5</span>
          </div>
        </div>
      )}
    </div>
  );
}
