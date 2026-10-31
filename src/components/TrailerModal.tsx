'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { modalBackdrop, modalScale } from '@/lib/animations';

interface TrailerModalProps {
  youtubeKey?: string;
  title: string;
  year?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TrailerModal({
  youtubeKey,
  title,
  year,
  isOpen,
  onClose,
}: TrailerModalProps) {
  const [activeKey, setActiveKey] = useState<string | null>(youtubeKey || null);
  const [loading, setLoading] = useState(false);
  const [searchUrl, setSearchUrl] = useState<string>(
    `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `${title} ${year || ''} official trailer`.trim()
    )}`
  );

  useEffect(() => {
    if (!isOpen) return;

    if (youtubeKey) {
      setActiveKey(youtubeKey);
      setLoading(false);
      setSearchUrl(`https://www.youtube.com/watch?v=${youtubeKey}`);
    } else {
      setActiveKey(null);
      setLoading(true);

      const fetchTrailer = async () => {
        try {
          const res = await fetch(
            `/api/trailer?title=${encodeURIComponent(title)}&year=${encodeURIComponent(year || '')}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.youtubeKey) {
              setActiveKey(data.youtubeKey);
              setSearchUrl(data.watchUrl || `https://www.youtube.com/watch?v=${data.youtubeKey}`);
            } else if (data.searchUrl) {
              setSearchUrl(data.searchUrl);
            }
          }
        } catch (err) {
          console.warn('Could not automatically resolve trailer:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchTrailer();
    }
  }, [isOpen, youtubeKey, title, year]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const directWatchUrl = activeKey
    ? `https://www.youtube.com/watch?v=${activeKey}`
    : searchUrl;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md"
        >
          <motion.div
            variants={modalScale}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-card border border-surface-border rounded-xl max-w-4xl w-full overflow-hidden shadow-2xl relative"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-border">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="material-symbols-outlined text-amber-gold">smart_display</span>
                <span className="font-headline-sm text-headline-sm text-text-primary truncate">
                  {title} — Official Theatrical Trailer
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={directWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-surface-elevated hover:bg-amber-gold hover:text-surface-void text-text-secondary text-xs font-bold transition-all border border-surface-border"
                  title="Open video on YouTube"
                >
                  <span>YouTube</span>
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>

                <button
                  onClick={onClose}
                  className="text-text-muted hover:text-text-primary p-1 rounded hover:bg-surface-elevated transition-colors"
                  aria-label="Close modal"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>

            {/* Video Stage / Loading / Playback */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
              {loading ? (
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-amber-gold/20 border border-amber-gold flex items-center justify-center mx-auto text-amber-gold animate-pulse">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <p className="text-sm text-text-secondary">Resolving 4K Theatrical Playback Stream...</p>
                  <span className="text-xs text-text-muted font-mono">Connecting to YouTube Official Trailer Stream</span>
                </div>
              ) : activeKey ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeKey}?autoplay=1&rel=0&modestbranding=1`}
                  title={`${title} Official Trailer`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-amber-gold/20 border border-amber-gold flex items-center justify-center mx-auto text-amber-gold">
                    <span
                      className="material-symbols-outlined text-3xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      play_arrow
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">Simulated 4K Theatrical Playback with Dolby Atmos Stream</p>
                  <span className="text-xs text-text-muted font-mono">Stream synced with YouTube &amp; Apple ProRes Master</span>
                  <div className="pt-2">
                    <a
                      href={searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-amber-gold hover:bg-amber-hover text-surface-void font-bold text-xs glow-gold transition-all"
                    >
                      <span>Search on YouTube</span>
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
