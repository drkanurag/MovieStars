'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getClientState } from '@/lib/storage';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();
  const [watchlistCount, setWatchlistCount] = useState(0);

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
    { label: 'Home', href: '/', icon: 'home' },
    { label: 'Search', href: '/search', icon: 'search' },
    { label: 'Browse', href: '/browse', icon: 'grid_view' },
    { label: 'Upcoming', href: '/upcoming', icon: 'calendar_month' },
    { label: 'Watchlist', href: '/watchlist', icon: 'bookmark', count: watchlistCount },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-surface-void/95 backdrop-blur-lg border-t border-surface-border py-2 px-4 flex justify-around items-center z-50">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 transition-colors relative',
              isActive ? 'text-amber-gold font-bold' : 'text-text-muted hover:text-text-primary'
            )}
          >
            <div className="relative">
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[8px] font-bold bg-amber-gold text-surface-void">
                  {item.count}
                </span>
              )}
            </div>
            <span className="text-[10px] font-label-sm">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
