'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { triggerStarConfetti } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  score: number; // out of 5
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (stars: number) => void;
  showValue?: boolean;
  totalVotes?: number;
  className?: string;
}

export function StarRating({
  score,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onRate,
  showValue = true,
  totalVotes,
  className,
}: StarRatingProps) {
  const [hoverScore, setHoverScore] = useState<number | null>(null);

  const starSize = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  const currentScore = hoverScore !== null ? hoverScore : score;

  const handleClick = (starNumber: number) => {
    if (!interactive) return;
    triggerStarConfetti();
    if (onRate) onRate(starNumber);
  };

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div className="flex items-center">
        {Array.from({ length: maxStars }).map((_, i) => {
          const starNumber = i + 1;
          const fillPercentage = Math.max(0, Math.min(1, currentScore - i));

          return (
            <motion.button
              key={i}
              type="button"
              disabled={!interactive}
              whileHover={interactive ? { scale: 1.35, y: -2 } : undefined}
              whileTap={interactive ? { scale: 0.85 } : undefined}
              onClick={() => handleClick(starNumber)}
              onMouseEnter={() => interactive && setHoverScore(starNumber)}
              onMouseLeave={() => interactive && setHoverScore(null)}
              className={cn(
                'relative p-0.5 transition-colors',
                interactive && 'cursor-pointer'
              )}
              title={interactive ? `Rate ${starNumber} / ${maxStars} stars` : `${score} out of ${maxStars} stars`}
            >
              {/* Background empty star */}
              <Star className={cn(starSize, 'text-zinc-700 transition-colors')} />

              {/* Foreground filled/half-filled star */}
              {fillPercentage > 0 && (
                <div
                  className="absolute inset-0.5 overflow-hidden text-cinema-gold drop-shadow-[0_0_8px_rgba(245,197,24,0.5)]"
                  style={{ width: `${fillPercentage * 100}%` }}
                >
                  <Star className={cn(starSize, 'fill-cinema-gold text-cinema-gold')} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {showValue && (
        <span className="font-black text-cinema-gold text-sm tracking-tight drop-shadow-sm">
          {score.toFixed(1)}
          <span className="text-zinc-500 font-normal text-xs">/5</span>
        </span>
      )}

      {totalVotes !== undefined && (
        <span className="text-zinc-500 text-xs font-medium">
          ({totalVotes > 1000 ? `${(totalVotes / 1000).toFixed(1)}k` : totalVotes})
        </span>
      )}
    </div>
  );
}
