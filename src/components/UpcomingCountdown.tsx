'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getDaysUntil } from '@/lib/utils';
import { Bell, Check, Calendar, Clock, Sparkles } from 'lucide-react';
import { getClientState, toggleListStatus } from '@/lib/storage';
import { triggerStarConfetti } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface UpcomingCountdownProps {
  releaseDate: string;
  titleId: string;
  titleName: string;
  className?: string;
}

export function UpcomingCountdown({
  releaseDate,
  titleId,
  titleName,
  className,
}: UpcomingCountdownProps) {
  const [countdown, setCountdown] = useState(getDaysUntil(releaseDate));
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const state = getClientState();
    setIsSubscribed(state.reminders.includes(titleId));

    const interval = setInterval(() => {
      setCountdown(getDaysUntil(releaseDate));
    }, 60000);

    const handleUpdate = () => {
      const s = getClientState();
      setIsSubscribed(s.reminders.includes(titleId));
    };

    window.addEventListener('moviestars_state_updated', handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('moviestars_state_updated', handleUpdate);
    };
  }, [releaseDate, titleId]);

  const handleToggleReminder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowActive = toggleListStatus(titleId, 'reminders');
    setIsSubscribed(nowActive);
    if (nowActive) {
      triggerStarConfetti();
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-white/10 shadow-lg',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-cinema-gold/10 text-cinema-gold border border-amber-400/20 shadow-sm">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-black text-white flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cinema-gold"></span>
            </span>
            <span className="text-cinema-gold font-bold tracking-tight">{countdown.text}</span>
          </div>
          <div className="text-[11px] text-zinc-400 font-medium mt-0.5">
            World Premiere: <strong>{new Date(releaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleToggleReminder}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md',
          isSubscribed
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
            : 'bg-cinema-gold text-black hover:bg-cinema-goldLight shadow-amber-500/20'
        )}
      >
        {isSubscribed ? (
          <>
            <Check className="w-4 h-4" />
            <span>Reminder Set</span>
          </>
        ) : (
          <>
            <Bell className="w-4 h-4 fill-current animate-bounce" />
            <span>Remind Me</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
