'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Film, Sparkles, Bookmark, Search } from 'lucide-react';
import { getClientState } from '@/lib/storage';
import { SearchModal } from './SearchModal';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const s = getClientState();
    setWatchlistCount(s.watchlist.length);

    const update = () => {
      const state = getClientState();
      setWatchlistCount(state.watchlist.length);
    };

    window.addEventListener('moviestars_state_updated', update);
    return () => window.removeEventListener('moviestars_state_updated', update);
  }, []);

  const items = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Browse', href: '/browse', icon: Film },
    { label: 'Upcoming', href: '/upcoming', icon: Sparkles, badge: 'Live' },
    { label: 'Watchlist', href: '/watchlist', icon: Bookmark, count: watchlistCount },
  ];

  return (
    <>
      <div className="lg:hidden fixed bottom-3 inset-x-3 z-40">
        <nav className="glass-panel-elevated border border-white/15 rounded-2xl p-1.5 shadow-2xl flex items-center justify-around backdrop-blur-2xl">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold transition-all flex-1',
                  isActive ? 'text-cinema-gold bg-white/10' : 'text-zinc-400 hover:text-white'
                )}
              >
                <div className="relative">
                  <Icon className={cn('w-4 h-4', isActive && 'fill-cinema-gold/20')} />
                  {item.count !== undefined && item.count > 0 && (
                    <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[8px] font-black bg-cinema-accent text-black">
                      {item.count}
                    </span>
                  )}
                </div>
                <span className="mt-0.5">{item.label}</span>
              </Link>
            );
          })}

          {/* Quick Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold text-zinc-400 hover:text-white transition-all flex-1"
          >
            <Search className="w-4 h-4 text-cinema-accent" />
            <span className="mt-0.5">Search</span>
          </button>
        </nav>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

