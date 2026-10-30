'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Play, Film, Loader2 } from 'lucide-react';
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

    // Reset when modal opens
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
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl"
        >
          <motion.div
            variants={modalScale}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl glass-panel-elevated border border-white/20 rounded-3xl overflow-hidden shadow-2xl bg-black"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-zinc-950/90">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-red-600 text-white shrink-0 shadow-md shadow-red-600/40">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </span>
                <h3 className="font-extrabold text-white text-xs sm:text-sm truncate">
                  <span>{title}</span>
                  {year && <span className="text-zinc-400 font-medium ml-1.5">({year})</span>}
                  <span className="text-[#f5c518] ml-2 hidden sm:inline">• Official Trailer</span>
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={directWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-600 text-white text-xs font-bold transition-colors border border-white/10 hover:border-red-500 shadow-sm"
                  title="Open video on YouTube"
                >
                  <span className="hidden sm:inline">Watch on</span> YouTube
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Stage / Loading / Fallback */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {loading ? (
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="relative w-14 h-14 rounded-full bg-red-600/20 flex items-center justify-center border border-red-500/30">
                    <Loader2 className="w-7 h-7 text-red-500 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">Finding Trailer on YouTube...</h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Searching for the official high-definition trailer of {title}
                    </p>
                  </div>
                </div>
              ) : activeKey ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeKey}?autoplay=1&rel=0&modestbranding=1`}
                  title={`${title} Official Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 p-8 text-center max-w-md">
                  <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-600/30">
                    <Film className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white">Watch {title} on YouTube</h4>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                      Click below to watch the official trailers, behind-the-scenes teasers, and clips directly on YouTube.
                    </p>
                  </div>
                  <a
                    href={directWatchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition-colors shadow-lg shadow-red-600/40"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Watch Trailer on YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer Note */}
            <div className="px-5 py-2.5 border-t border-white/5 bg-zinc-950 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Streamed via YouTube Video Embed API
              </span>
              <a
                href={directWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#f5c518] transition-colors"
              >
                Having playback restrictions? Open in YouTube ↗
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
