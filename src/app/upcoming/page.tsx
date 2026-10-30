import React from 'react';
import { getUpcomingTitles } from '@/lib/api/movieStore';
import { MovieCard } from '@/components/MovieCard';
import { UpcomingCountdown } from '@/components/UpcomingCountdown';
import { Sparkles, Bell, Calendar, Video } from 'lucide-react';

export default function UpcomingPage() {
  const upcomingTitles = getUpcomingTitles();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-cinema-border/70 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cinema-red/20 text-cinema-red">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Upcoming Releases & Countdowns
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Live countdown clocks, release dates, official trailers, and release alerts for upcoming cinema & streaming drops
            </p>
          </div>
        </div>
      </div>

      {/* Featured Upcoming List with Highlighted Countdown Bars */}
      <div className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cinema-gold" />
          Most Anticipated Titles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingTitles.map((title) => (
            <div
              key={title.id}
              className="p-4 rounded-xl bg-cinema-card border border-cinema-border flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-cinema-accent uppercase">
                    {title.type.replace('_', ' ')} • {title.originalLanguage.toUpperCase()}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {new Date(title.releaseDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{title.title}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{title.overview}</p>
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

      {/* Standard Upcoming Movie Cards Grid */}
      <div className="space-y-4 pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          All Upcoming Releases
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {upcomingTitles.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  );
}

