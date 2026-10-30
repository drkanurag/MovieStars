'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCatalog } from '@/lib/api/movieStore';
import { MovieCard } from '@/components/MovieCard';
import { getClientState } from '@/lib/storage';
import { Bookmark, Heart, CheckCircle2, Bell, Film } from 'lucide-react';
import { TitleItem, WatchlistState } from '@/types/movie';

export default function WatchlistPage() {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'watched' | 'favorites' | 'reminders'>('watchlist');
  const [state, setState] = useState<WatchlistState | null>(null);

  useEffect(() => {
    setState(getClientState());

    const handleUpdate = () => {
      setState(getClientState());
    };

    window.addEventListener('moviestars_state_updated', handleUpdate);
    return () => window.removeEventListener('moviestars_state_updated', handleUpdate);
  }, []);

  if (!state) {
    return <div className="py-20 text-center text-zinc-400">Loading your library...</div>;
  }

  const catalog = getCatalog();

  const getTitlesForList = (ids: string[]): TitleItem[] => {
    return catalog.filter((item) => ids.includes(item.id));
  };

  const lists = {
    watchlist: getTitlesForList(state.watchlist),
    watched: getTitlesForList(state.watched),
    favorites: getTitlesForList(state.favorites),
    reminders: getTitlesForList(state.reminders),
  };

  const currentItems = lists[activeTab];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-cinema-border/70 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <Bookmark className="w-7 h-7 text-cinema-gold" />
          My Cinema Library
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Manage your watchlists, favorites, completed movies, and release drop reminders
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-cinema-card p-2 rounded-xl border border-cinema-border">
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'watchlist'
              ? 'bg-[#f5c518] text-black font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Watchlist ({lists.watchlist.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('watched')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'watched'
              ? 'bg-emerald-500 text-black font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Watched ({lists.watched.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'favorites'
              ? 'bg-cinema-red text-white font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Favorites ({lists.favorites.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'reminders'
              ? 'bg-cinema-gold text-black font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Release Reminders ({lists.reminders.length})</span>
        </button>
      </div>

      {/* Items Grid */}
      {currentItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {currentItems.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-cinema-card rounded-2xl border border-cinema-border">
          <Film className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Your {activeTab} is currently empty</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Browse the catalog to add upcoming movies or favorites to this list.
          </p>
          <Link
            href="/browse"
            className="mt-4 inline-block px-4 py-2 bg-cinema-gold text-black rounded-xl text-xs font-bold"
          >
            Explore Movies & TV
          </Link>
        </div>
      )}
    </div>
  );
}
