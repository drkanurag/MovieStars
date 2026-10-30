import React from 'react';
import Link from 'next/link';
import { Star, ShieldAlert, Heart, ExternalLink, Film, Tv, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full glass-panel border-t border-white/[0.08] text-zinc-400 text-xs py-14 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-md bg-[#f5c518] text-black font-black text-lg tracking-tighter shadow-md shadow-amber-500/20 flex items-center gap-1">
                <span>MovieStars</span>
                <Star className="w-3.5 h-3.5 fill-black text-black" />
              </div>
            </div>
            <p className="text-zinc-400 text-xs max-w-md leading-relaxed font-medium">
              The definitive cinema discovery engine. Combining Bayesian weighted star ratings,
              upcoming countdown clocks, and real-time streaming availability across Netflix,
              Amazon Prime Video, Disney+ Hotstar, JioCinema, Apple TV, and Zee5.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-black text-white uppercase tracking-widest text-[11px] mb-3.5">
              Explore
            </h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <Link href="/browse" className="hover:text-cinema-gold transition-colors flex items-center gap-1.5">
                  <span>Browse All Titles</span>
                </Link>
              </li>
              <li>
                <Link href="/upcoming" className="hover:text-cinema-gold transition-colors flex items-center gap-1.5">
                  <span>Upcoming Countdowns</span>
                </Link>
              </li>
              <li>
                <Link href="/top-rated" className="hover:text-cinema-gold transition-colors flex items-center gap-1.5">
                  <span>Top 250 Best of All Time</span>
                </Link>
              </li>
              <li>
                <Link href="/watchlist" className="hover:text-cinema-gold transition-colors flex items-center gap-1.5">
                  <span>My Cinema Library</span>
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-cinema-gold transition-colors flex items-center gap-1.5">
                  <span>Worldwide Catalog Search</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Attributions */}
          <div>
            <h4 className="font-black text-white uppercase tracking-widest text-[11px] mb-3.5">
              Legal & Data Attribution
            </h4>
            <div className="space-y-3 text-[11px] text-zinc-400 font-medium">
              <p>
                This product uses the <strong>TMDB API</strong> but is not endorsed or certified by TMDB.
              </p>
              <p>
                Where to watch streaming availability data powered by <strong>JustWatch</strong>.
              </p>
              <p>
                IMDb ratings and vote counts synced via licensed OMDb API services.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright Bar */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p className="text-zinc-500 font-medium">
            © {new Date().getFullYear()} MovieStars. Designed with high-performance Next.js & Tailwind CSS.
          </p>
          <div className="flex items-center gap-4 text-zinc-400 font-semibold">
            <span className="flex items-center gap-1.5 text-cinema-accent">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Official Streaming Platform Redirection Only • No Piracy</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
