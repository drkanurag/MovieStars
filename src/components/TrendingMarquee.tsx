'use client';

import React from 'react';
import Link from 'next/link';

const MARQUEE_ITEMS = [
  { label: 'NOW TRENDING', text: 'Dune: Part Two & Oppenheimer', color: 'text-amber-gold', href: '/browse' },
  { label: 'BAYESIAN TOP 250', text: 'The Godfather • The Dark Knight • Pulp Fiction', color: 'text-electric-violet', href: '/top-rated' },
  { label: 'WHERE TO WATCH', text: 'Streaming availability across 180+ countries', color: 'text-cyber-cyan', href: '/browse' },
  { label: 'GLOBAL CATALOG', text: '11,200,000+ Worldwide IMDb & TMDB Titles', color: 'text-amber-gold', href: '/search' },
  { label: 'WANT TO WATCH', text: 'Save movies & TV shows with instant watch-time tracking', color: 'text-electric-violet', href: '/watchlist' },
];

export function TrendingMarquee() {
  return (
    <div className="w-full bg-surface-card border-b border-surface-border overflow-hidden py-1.5 px-4 text-xs font-label-sm tracking-widest text-text-secondary select-none z-50">
      <div className="flex items-center gap-4">
        {/* Live Feed Indicator */}
        <div className="flex items-center gap-1.5 shrink-0 text-amber-gold font-bold pr-3 border-r border-surface-border">
          <span className="w-2 h-2 rounded-full bg-amber-gold animate-ping" />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-gold -ml-2.5" />
          <span>LIVE FEED</span>
        </div>

        {/* Marquee Runner */}
        <div className="overflow-hidden w-full">
          <div className="animate-marquee flex items-center gap-12 font-medium">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => (
              <React.Fragment key={index}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2 hover:text-text-primary transition-colors cursor-pointer shrink-0"
                >
                  <span className={`${item.color} font-bold`}>{item.label}:</span>
                  <span className="text-text-primary">{item.text}</span>
                </Link>
                <span className="text-surface-border">•</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
