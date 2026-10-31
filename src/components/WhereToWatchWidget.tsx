'use client';

import React, { useState, useEffect } from 'react';
import { RegionAvailability } from '@/types/movie';
import { COUNTRIES } from '@/lib/data/mockMovies';
import { getSelectedCountry, setSelectedCountry } from '@/lib/storage';
import { ExternalLink, Tv, ShoppingCart, Film, Globe, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhereToWatchWidgetProps {
  availability: Record<string, RegionAvailability>;
  titleName: string;
  className?: string;
}

export function WhereToWatchWidget({
  availability,
  titleName,
  className,
}: WhereToWatchWidgetProps) {
  const [activeCountry, setActiveCountry] = useState('IN');
  const [activeTab, setActiveTab] = useState<'stream' | 'rent' | 'buy'>('stream');

  useEffect(() => {
    setActiveCountry(getSelectedCountry());

    const handleCountryChange = () => {
      setActiveCountry(getSelectedCountry());
    };

    window.addEventListener('moviestars_country_updated', handleCountryChange);
    return () => window.removeEventListener('moviestars_country_updated', handleCountryChange);
  }, []);

  const handleCountrySelect = (code: string) => {
    setActiveCountry(code);
    setSelectedCountry(code);
  };

  const currentRegionData = availability[activeCountry] || availability['IN'];

  const streamOffers = currentRegionData?.stream || [];
  const rentOffers = currentRegionData?.rent || [];
  const buyOffers = currentRegionData?.buy || [];

  const currentOffers = {
    stream: streamOffers,
    rent: rentOffers,
    buy: buyOffers,
  }[activeTab];

  const getProviderDirectUrl = (providerName: string, title: string, directUrl?: string) => {
    if (directUrl && directUrl.startsWith('http') && !directUrl.includes('google.com')) {
      return directUrl;
    }
    const n = providerName.toLowerCase();
    const q = encodeURIComponent(title);
    if (n.includes('netflix')) return `https://www.netflix.com/search?q=${q}`;
    if (n.includes('prime')) return `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${q}`;
    if (n.includes('hotstar') || n.includes('disney')) return `https://www.hotstar.com/in/explore?search_query=${q}`;
    if (n.includes('jio')) return `https://www.jiocinema.com/search/${q}`;
    if (n.includes('apple')) return `https://tv.apple.com/search?term=${q}`;
    if (n.includes('zee')) return `https://www.zee5.com/search?q=${q}`;
    if (n.includes('sony')) return `https://www.sonyliv.com/search/${q}`;
    return `https://www.justwatch.com/in/search?q=${q}`;
  };

  const getPlatformStyle = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('netflix')) return 'border-red-500/40 hover:border-red-500 hover:shadow-red-500/20';
    if (n.includes('prime')) return 'border-sky-500/40 hover:border-sky-500 hover:shadow-sky-500/20';
    if (n.includes('hotstar') || n.includes('disney')) return 'border-cyan-500/40 hover:border-cyan-500 hover:shadow-cyan-500/20';
    if (n.includes('jio')) return 'border-blue-600/40 hover:border-blue-500 hover:shadow-blue-500/20';
    if (n.includes('apple')) return 'border-zinc-400/40 hover:border-white hover:shadow-white/20';
    if (n.includes('zee')) return 'border-purple-500/40 hover:border-purple-500 hover:shadow-purple-500/20';
    return 'border-cinema-border hover:border-cinema-accent';
  };

  return (
    <div className={cn('p-6 rounded-3xl glass-panel border border-cinema-border/70 shadow-2xl space-y-5', className)}>
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cinema-accent/20 text-cinema-accent">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Where to Watch <span className="text-zinc-400 font-medium text-sm">({titleName})</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Official streaming availability verified via JustWatch & TMDB
              </p>
            </div>
          </div>
        </div>

        {/* Region / Country Selector */}
        <div className="flex items-center gap-2 glass-pill px-3 py-1.5 rounded-xl border border-white/10 text-xs">
          <Globe className="w-4 h-4 text-cinema-gold" />
          <span className="text-zinc-400 font-semibold">Region:</span>
          <select
            value={activeCountry}
            onChange={(e) => handleCountrySelect(e.target.value)}
            className="bg-transparent text-white font-bold outline-none cursor-pointer"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-cinema-card text-white">
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Offer Type Tabs (Stream, Rent, Buy) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('stream')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm',
            activeTab === 'stream'
              ? 'bg-cinema-accent text-black shadow-sky-500/25'
              : 'glass-pill text-zinc-400 hover:text-white hover:bg-white/10'
          )}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Stream with Subscription ({streamOffers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rent')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm',
            activeTab === 'rent'
              ? 'bg-cinema-gold text-black shadow-amber-500/25'
              : 'glass-pill text-zinc-400 hover:text-white hover:bg-white/10'
          )}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Rent in HD ({rentOffers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('buy')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm',
            activeTab === 'buy'
              ? 'bg-emerald-500 text-black shadow-emerald-500/25'
              : 'glass-pill text-zinc-400 hover:text-white hover:bg-white/10'
          )}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Buy ({buyOffers.length})</span>
        </button>
      </div>

      {/* Platform Cards Grid */}
      <div>
        {currentOffers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {currentOffers.map((offer, idx) => (
              <a
                key={idx}
                href={getProviderDirectUrl(offer.provider.name, titleName, offer.streamUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-3.5 p-3.5 rounded-2xl glass-panel border transition-all duration-300 hover:scale-[1.02] shadow-lg group',
                  getPlatformStyle(offer.provider.name)
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center font-black text-xs text-cinema-gold border border-white/10 shrink-0 group-hover:scale-105 transition-transform">
                  {offer.provider.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold text-white truncate group-hover:text-cinema-gold transition-colors">
                    {offer.provider.name}
                  </div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                    <span>{offer.offerType === 'stream' ? 'Watch Now' : `${offer.offerType.toUpperCase()} in 4K`}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-white" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 glass-pill rounded-2xl text-zinc-400 text-xs">
            No {activeTab} providers listed in {COUNTRIES.find((c) => c.code === activeCountry)?.name || activeCountry} right now.
            Try switching the country selector above to check global availability.
          </div>
        )}
      </div>
    </div>
  );
}
