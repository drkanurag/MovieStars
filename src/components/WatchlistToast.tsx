'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Check, X, ArrowRight, Heart, CheckCircle2, Bell } from 'lucide-react';

interface ToastData {
  id: number;
  label: string;
  movieTitle: string;
  active: boolean;
  listKey: 'watchlist' | 'watched' | 'favorites' | 'reminders';
}

export function WatchlistToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{
        titleId: string;
        movieTitle: string;
        listKey: 'watchlist' | 'watched' | 'favorites' | 'reminders';
        active: boolean;
        label: string;
      }>;

      if (!customEvent.detail) return;

      const newToast: ToastData = {
        id: Date.now(),
        label: customEvent.detail.label,
        movieTitle: customEvent.detail.movieTitle,
        active: customEvent.detail.active,
        listKey: customEvent.detail.listKey,
      };

      setToasts((prev) => [...prev.slice(-2), newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3500);
    };

    window.addEventListener('moviestars_toast', handleToast);
    return () => window.removeEventListener('moviestars_toast', handleToast);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isWatchlist = toast.listKey === 'watchlist';
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="pointer-events-auto p-4 rounded-2xl bg-[#1a1a1a]/95 backdrop-blur-2xl border border-white/20 shadow-2xl flex items-start gap-3.5"
            >
              {/* Icon */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  toast.active
                    ? isWatchlist
                      ? 'bg-[#f5c518] text-black'
                      : 'bg-emerald-500 text-black'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {toast.active ? (
                  isWatchlist ? (
                    <Bookmark className="w-5 h-5 fill-current" />
                  ) : (
                    <Check className="w-5 h-5 stroke-[3]" />
                  )
                ) : (
                  <X className="w-5 h-5" />
                )}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-white flex items-center justify-between">
                  <span>{toast.label}</span>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="text-zinc-500 hover:text-white p-0.5 ml-2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-zinc-300 font-semibold truncate mt-0.5">
                  &ldquo;{toast.movieTitle}&rdquo;
                </p>
                {toast.active && isWatchlist && (
                  <Link
                    href="/watchlist"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#f5c518] hover:text-amber-300 mt-1.5 transition-colors"
                  >
                    <span>View in My Library</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
