import React from 'react';
import type { Metadata } from 'next';
import { getUpcomingTitles } from '@/lib/api/movieStore';
import { syncLiveOpenReleases } from '@/lib/api/liveOpenSync';
import { MovieCard } from '@/components/MovieCard';
import { UpcomingCountdown } from '@/components/UpcomingCountdown';
import { Sparkles, Calendar, Radio, Film, Tv, RefreshCw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Upcoming Movies & Series Countdowns — Live Auto-Updated Releases | MovieStars',
  description:
    'Live countdown timers, premiere dates, storylines, and official trailers for upcoming cinema movies and streaming series launching worldwide. Auto-updated via open source cinema APIs and Google release radar.',
};

// Revalidate page hourly for continuous live auto-updates
export const revalidate = 3600;

export default async function UpcomingPage() {
  // Automatically sync newly announced upcoming releases from open-source APIs
  await syncLiveOpenReleases();
  const upcomingTitles = getUpcomingTitles();

  const movies = upcomingTitles.filter((t) => t.type === 'movie');
  const series = upcomingTitles.filter((t) => t.type === 'tv' || t.type === 'web_series');

  return (
    <div className="space-y-8">
      {/* Header & Auto-Sync Live Status */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#f5c518] text-black shadow-lg shadow-amber-500/20">
            <Sparkles className="w-7 h-7 fill-black" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Upcoming Releases</span>
              <span className="text-sm font-bold text-black bg-[#f5c518] px-2.5 py-0.5 rounded-full">
                {upcomingTitles.length} Launching
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Real-time countdown clocks, confirmed release dates, storylines, and official YouTube trailers for anticipated movies and streaming series.
            </p>
          </div>
        </div>

        {/* Live Open-Source API Auto-Update Badge */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl glass-panel border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 text-xs shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="flex flex-col">
            <span className="font-extrabold text-[11px] text-white flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              Live API Auto-Update Active
            </span>
            <span className="text-[10px] text-zinc-400">
              Connected to Cinemeta & Google Release Feeds
            </span>
          </div>
        </div>
      </div>

      {/* Featured Anticipated Launches with Live Countdown Clocks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#f5c518]" />
            <span>Featured Launch Radar (Next Major Drops)</span>
          </h2>
          <span className="text-xs text-zinc-400 font-medium">
            Synchronized with global theatrical & streaming schedules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingTitles.slice(0, 6).map((title) => (
            <div
              key={title.id}
              className="p-5 rounded-2xl glass-panel border border-white/10 hover:border-cinema-gold/60 transition-all flex flex-col justify-between gap-4 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white/10 text-[#f5c518]">
                    {title.type === 'movie' ? 'Cinema Drop' : 'Prestige Series'}
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold">
                    {new Date(title.releaseDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h3 className="text-base font-black text-white group-hover:text-[#f5c518] transition-colors line-clamp-1">
                  {title.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
                  {title.overview}
                </p>
              </div>

              {/* Countdown Component */}
              <UpcomingCountdown
                releaseDate={title.releaseDate}
                titleId={title.id}
                titleName={title.title}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Catalog Split: Upcoming Movies & Web Series */}
      <div className="space-y-8 pt-4">
        {/* Upcoming Movies */}
        {movies.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-[#f5c518]" />
                <span>Upcoming Theatrical & Global Movies ({movies.length})</span>
              </h2>
              <span className="text-xs text-zinc-400 font-semibold hidden sm:inline">
                Hover card to play official trailer
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Web Series */}
        {series.length > 0 && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-[#f5c518]" />
                <span>Upcoming Streaming & Web Series Launches ({series.length})</span>
              </h2>
              <span className="text-xs text-zinc-400 font-semibold hidden sm:inline">
                Streaming on Netflix, Prime Video, HBO & Disney+
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
              {series.map((show) => (
                <MovieCard key={show.id} movie={show} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
