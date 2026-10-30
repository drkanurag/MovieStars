'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Trophy, Tv, Film, Flame } from 'lucide-react';

const MARQUEE_ITEMS = [
  { icon: Flame, text: 'NOW TRENDING', highlight: 'Dune: Part Two & Oppenheimer', href: '/browse' },
  { icon: Trophy, text: 'BAYESIAN TOP 250', highlight: 'The Godfather • The Dark Knight • Pulp Fiction', href: '/top-rated' },
  { icon: Tv, text: 'WHERE TO WATCH', highlight: 'Streaming availability across 180+ countries', href: '/browse' },
  { icon: Film, text: 'GLOBAL CATALOG', highlight: '11,200,000+ Worldwide IMDb & TMDB Titles', href: '/admin' },
  { icon: Sparkles, text: 'WANT TO WATCH', highlight: 'Save movies & TV shows with instant watch-time tracking', href: '/watchlist' },
];

export function TrendingMarquee() {
  return (
    <div className="w-full bg-[#111622]/90 border-b border-white/[0.08] backdrop-blur-md overflow-hidden py-1.5 select-none z-30">
      <div className="animate-marquee flex items-center gap-8 text-xs font-semibold whitespace-nowrap">
        {/* Double array for infinite seamless looping */}
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={index}
              href={item.href}
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5c518] group-hover:scale-125 transition-transform" />
              <Icon className="w-3.5 h-3.5 text-[#f5c518]" />
              <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 group-hover:text-amber-400 transition-colors">
                {item.text}:
              </span>
              <span className="text-zinc-200 group-hover:text-white transition-colors font-medium">
                {item.highlight}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

