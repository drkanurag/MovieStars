'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCatalog } from '@/lib/api/movieStore';
import { MovieCard } from '@/components/MovieCard';
import { getClientState, toggleListStatus, clearList } from '@/lib/storage';
import {
  Bookmark,
  Heart,
  CheckCircle2,
  Bell,
  Film,
  Clock,
  Share2,
  Trash2,
  Sparkles,
  Check,
  Tv,
} from 'lucide-react';
import { TitleItem, WatchlistState } from '@/types/movie';
import { formatRuntime } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function WatchlistPage() {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'watched' | 'favorites' | 'reminders'>('watchlist');
  const [subType, setSubType] = useState<'all' | 'movie' | 'series'>('all');
  const [state, setState] = useState<WatchlistState | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    setState(getClientState());

    const handleUpdate = () => {
      setState(getClientState());
    };

    window.addEventListener('moviestars_state_updated', handleUpdate);
    return () => window.removeEventListener('moviestars_state_updated', handleUpdate);
  }, []);

  if (!state) {
    return <div className="py-20 text-center text-zinc-400">Loading your cinema library...</div>;
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

  const rawItems = lists[activeTab];

  // Sub-filter by type
  const currentItems = rawItems.filter((item) => {
    if (subType === 'movie') return item.type === 'movie';
    if (subType === 'series') return item.type === 'tv' || item.type === 'web_series';
    return true;
  });

  // Calculate total runtime of saved titles
  const totalMinutes = rawItems.reduce((acc, item) => {
    return acc + (item.runtimeMinutes || (item.episodesCount ? item.episodesCount * 45 : 120));
  }, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;

  const handleShare = () => {
    const listTitles = rawItems.map((t) => t.title).join(', ');
    const textToCopy = `My MovieStars ${activeTab} List (${rawItems.length} titles): ${listTitles}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleClear = () => {
    if (window.confirm(`Are you sure you want to clear all ${rawItems.length} items from your ${activeTab}?`)) {
      clearList(activeTab);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Page Header & Description */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#f5c518] text-black shadow-lg shadow-amber-500/20">
              <Bookmark className="w-7 h-7 fill-black" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2">
                Saved Movies & Series <span className="text-[#f5c518]">— Want to Watch</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Your personal offline and synced cinema library for tracking titles to watch, favorites, and completed watches
              </p>
            </div>
          </div>
        </div>

        {/* Quick Share & Clear Actions */}
        {rawItems.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-bold text-zinc-200 hover:text-white transition-colors"
            >
              {copiedShare ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#f5c518]" />
                  <span>Share List</span>
                </>
              )}
            </button>

            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-red-950/40 border border-white/10 hover:border-red-500/40 text-xs font-bold text-zinc-400 hover:text-red-400 transition-colors"
              title="Clear this list"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Library Statistics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 rounded-3xl bg-[#1a1a1a] border border-white/10 shadow-xl">
        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Saved in {activeTab}
          </span>
          <div className="text-xl sm:text-2xl font-black text-white flex items-center gap-1.5">
            <Film className="w-5 h-5 text-[#f5c518]" />
            <span>{rawItems.length} Titles</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Total Est. Watch Time
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#f5c518] flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-[#f5c518]" />
            <span>
              {totalHours}h {remainingMins}m
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Movies vs Series
          </span>
          <div className="text-sm sm:text-base font-extrabold text-zinc-200 mt-1">
            {rawItems.filter((i) => i.type === 'movie').length} Movies •{' '}
            {rawItems.filter((i) => i.type !== 'movie').length} Series
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Storage Sync
          </span>
          <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Synced Locally</span>
          </div>
        </div>
      </div>

      {/* 3. Primary List Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#1a1a1a] border border-white/10">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer',
              activeTab === 'watchlist'
                ? 'bg-[#f5c518] text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Bookmark className="w-4 h-4 fill-current" />
            <span>Want to Watch ({lists.watchlist.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('watched')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer',
              activeTab === 'watched'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Watched ({lists.watched.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer',
              activeTab === 'favorites'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>Favorites ({lists.favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer',
              activeTab === 'reminders'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Bell className="w-4 h-4" />
            <span>Release Reminders ({lists.reminders.length})</span>
          </button>
        </div>

        {/* Sub-Filters by Type */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#1a1a1a] border border-white/10 text-xs">
          <button
            onClick={() => setSubType('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-bold transition-colors',
              subType === 'all' ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white'
            )}
          >
            All
          </button>
          <button
            onClick={() => setSubType('movie')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-bold transition-colors',
              subType === 'movie' ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white'
            )}
          >
            Movies
          </button>
          <button
            onClick={() => setSubType('series')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-bold transition-colors',
              subType === 'series' ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white'
            )}
          >
            Series
          </button>
        </div>
      </div>

      {/* 4. Saved Titles Grid or Empty State */}
      {currentItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {currentItems.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 p-8 rounded-3xl bg-[#1a1a1a] border border-white/10 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-[#f5c518]">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-white">
            No titles saved in &ldquo;{activeTab}&rdquo; yet
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            Whenever you see a movie or series you want to watch, click the{' '}
            <strong className="text-[#f5c518]">+ Save to Watchlist</strong> button or the corner bookmark ribbon to add it here.
          </p>
          <div className="pt-2">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#f5c518] hover:bg-amber-400 text-black font-black text-xs transition-colors shadow-lg shadow-amber-500/25"
            >
              <span>Explore Catalog to Save Titles</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
