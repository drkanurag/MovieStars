import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-surface-void border-t border-surface-border mt-12">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12 space-y-10">
        {/* Top Grid: Brand Pitch, Navigation Links, Legal Attributions */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Platform Pitch */}
          <div className="md:col-span-5 space-y-3">
            <Link href="/" className="inline-block">
              <span className="font-headline-md text-headline-md tracking-wider text-surface-void bg-amber-gold px-2.5 py-0.5 rounded inline-block">
                MovieStars
              </span>
            </Link>
            <p className="font-body-sm text-body-sm text-text-secondary max-w-md leading-relaxed">
              The definitive cinema discovery engine. Combining Bayesian weighted star ratings,
              upcoming countdown clocks, and real-time streaming availability across Netflix, Amazon Prime
              Video, Disney+ Hotstar, JioCinema, Apple TV, and Zee5.
            </p>
            <div className="flex items-center gap-4 pt-2 text-text-muted">
              <span className="text-xs font-mono">v4.8.2-PROD</span>
              <span>•</span>
              <span className="text-xs flex items-center gap-1 text-cyber-cyan font-semibold">
                <span className="material-symbols-outlined text-xs">speed</span>
                <span>99.98% Synced</span>
              </span>
            </div>
          </div>

          {/* Explore Navigation Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-headline-sm text-headline-sm text-text-primary tracking-wider">Explore</h4>
            <ul className="space-y-2 font-body-sm text-body-sm">
              <li>
                <Link
                  href="/browse"
                  className="text-text-muted hover:text-text-secondary transition-colors duration-150"
                >
                  Browse All Titles
                </Link>
              </li>
              <li>
                <Link
                  href="/upcoming"
                  className="text-text-muted hover:text-text-secondary transition-colors duration-150"
                >
                  Upcoming Countdowns
                </Link>
              </li>
              <li>
                <Link
                  href="/top-rated"
                  className="text-text-muted hover:text-text-secondary transition-colors duration-150"
                >
                  Top 250 Best of All Time
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-text-muted hover:text-text-secondary transition-colors duration-150"
                >
                  Genre &amp; Language Matrix
                </Link>
              </li>
              <li>
                <Link
                  href="/watchlist"
                  className="text-text-muted hover:text-text-secondary transition-colors duration-150"
                >
                  My Cinema Library
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-text-muted hover:text-text-secondary transition-colors duration-150"
                >
                  Worldwide Catalog Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Attribution Column */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-headline-sm text-headline-sm text-text-primary tracking-wider">
              Legal &amp; Data Attribution
            </h4>
            <div className="space-y-2 font-caption text-caption text-text-muted leading-relaxed">
              <p>
                This product uses the <strong className="text-text-secondary">TMDB API</strong> but is not
                endorsed or certified by TMDB.
              </p>
              <p>
                Where to watch streaming availability data powered by{' '}
                <strong className="text-text-secondary">JustWatch</strong>.
              </p>
              <p>
                IMDb ratings and vote counts synced via licensed{' '}
                <strong className="text-text-secondary">OMDb API</strong> services.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-surface-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-caption text-caption text-text-muted">
          <div>
            © {new Date().getFullYear()} MovieStars. Designed with high-performance Next.js &amp; Tailwind CSS.
          </div>
          <div className="flex items-center gap-2 text-cyber-cyan font-semibold">
            <span className="material-symbols-outlined text-sm">gavel</span>
            <span>Official Streaming Platform Redirection Only • No Piracy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
