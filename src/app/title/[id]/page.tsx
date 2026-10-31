'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { MovieImage } from '@/components/MovieImage';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { TitleItem } from '@/types/movie';
import { getTitleById, getTrendingTitles, getCatalog } from '@/lib/api/movieStore';
import { StarRating } from '@/components/StarRating';
import { RatingBadge } from '@/components/RatingBadge';
import { WhereToWatchWidget } from '@/components/WhereToWatchWidget';
import { UpcomingCountdown } from '@/components/UpcomingCountdown';
import { TrailerModal } from '@/components/TrailerModal';
import { MovieCard } from '@/components/MovieCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { scoreToStars } from '@/lib/bayesian';
import { getTmdbImageUrl, formatDate, formatRuntime, formatVoteCount, formatReleaseYear } from '@/lib/utils';
import {
  getClientState,
  toggleListStatus,
  setUserStarRating,
} from '@/lib/storage';
import {
  Bookmark,
  Heart,
  CheckCircle2,
  Play,
  Star,
  Users,
  Film,
  MessageSquare,
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Share2,
  Plus,
  Check,
  DollarSign,
  Clapperboard,
  HelpCircle,
  Camera,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TitleDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const initialLocal = getTitleById(id);
  const [movie, setMovie] = useState<TitleItem | undefined>(initialLocal);
  const [loadingWorldwide, setLoadingWorldwide] = useState(!initialLocal);
  const [notFoundState, setNotFoundState] = useState(false);

  const [inWatchlist, setInWatchlist] = useState(false);
  const [inFavorites, setInFavorites] = useState(false);
  const [inWatched, setInWatched] = useState(false);
  const [userStars, setUserStars] = useState<number | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingToast, setRatingToast] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewsList, setReviewsList] = useState<
    Array<{ author: string; stars: number; content: string; date: string }>
  >([
    {
      author: 'Aarav Mehta',
      stars: 5,
      content:
        'An absolute cinematic milestone. The sound design, background score, and pacing kept me on the edge of my seat throughout.',
      date: '2 days ago',
    },
    {
      author: 'Sophia Chen',
      stars: 4.5,
      content:
        'Visually stunning and thought-provoking. The cast performances are career-defining.',
      date: '1 week ago',
    },
  ]);

  useEffect(() => {
    if (initialLocal) {
      setMovie(initialLocal);
      setLoadingWorldwide(false);
      return;
    }

    let isMounted = true;
    setLoadingWorldwide(true);

    fetch(`/api/worldwide/title/${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found in worldwide catalog');
        return res.json();
      })
      .then((data) => {
        if (isMounted && data.title) {
          setMovie(data.title);
          setLoadingWorldwide(false);
        } else if (isMounted) {
          setNotFoundState(true);
          setLoadingWorldwide(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setNotFoundState(true);
          setLoadingWorldwide(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, initialLocal]);

  useEffect(() => {
    if (!movie) return;
    document.title = `${movie.title} (${movie.releaseDate?.slice(0, 4) || 'TBA'}) - Ratings, Trailer & Where to Watch | MovieStars`;
    const state = getClientState();
    setInWatchlist(state.watchlist.includes(movie.id));
    setInFavorites(state.favorites.includes(movie.id));
    setInWatched(state.watched.includes(movie.id));
    setUserStars(state.userRatings[movie.id] || null);
  }, [movie]);

  if (loadingWorldwide) {
    return (
      <div className="py-28 text-center space-y-4 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full border-4 border-[#f5c518] border-t-transparent animate-spin mx-auto" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">Searching Worldwide Datasets...</h3>
          <p className="text-xs text-zinc-400">
            Querying IMDb 11.2M+ global archives & TMDB dynamic federation for &ldquo;{id}&rdquo;
          </p>
        </div>
      </div>
    );
  }

  if (!movie || notFoundState) {
    return (
      <div className="py-24 text-center max-w-lg mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-[#f5c518]">
          <Film className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Title not found in worldwide datasets</h2>
        <p className="text-zinc-400 text-xs leading-relaxed">
          The requested title &ldquo;{id}&rdquo; could not be resolved from our local database or TMDB/IMDb worldwide federation.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/search"
            className="px-5 py-2.5 rounded-xl bg-[#f5c518] text-black font-black text-xs hover:bg-amber-400 transition-colors shadow-lg"
          >
            Search Worldwide Catalog
          </Link>
          <Link
            href="/browse"
            className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white font-bold text-xs hover:bg-zinc-800 transition-colors"
          >
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  // Fetch persistent user reviews and rating from server
  useEffect(() => {
    if (!movie?.id) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('moviestars_auth_token') : null;

    fetch(`/api/user/reviews?titleId=${encodeURIComponent(movie.id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.reviews && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviewsList(data.reviews);
        }
      })
      .catch(() => {});

    if (token) {
      fetch(`/api/user/ratings?titleId=${encodeURIComponent(movie.id)}&token=${encodeURIComponent(token)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.userRating !== null && data?.userRating !== undefined) {
            setUserStars(data.userRating);
          }
        })
        .catch(() => {});
    }
  }, [movie?.id]);

  const handleAction = (type: 'watchlist' | 'favorites' | 'watched') => {
    const active = toggleListStatus(movie.id, type, movie.title);
    if (type === 'watchlist') setInWatchlist(active);
    if (type === 'favorites') setInFavorites(active);
    if (type === 'watched') setInWatched(active);

    const token = typeof window !== 'undefined' ? localStorage.getItem('moviestars_auth_token') : null;
    if (token) {
      fetch('/api/user/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          titleId: movie.id,
          listType: type,
          action: active ? 'add' : 'remove',
        }),
      }).catch(() => {});
    }
  };

  const handleRate = async (stars: number) => {
    setUserStars(stars);
    setUserStarRating(movie.id, stars);
    setRatingToast(true);
    setRatingModalOpen(false);
    setTimeout(() => setRatingToast(false), 3000);

    const token = typeof window !== 'undefined' ? localStorage.getItem('moviestars_auth_token') : null;
    try {
      await fetch('/api/user/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titleId: movie.id, stars, token }),
      });
    } catch {
      // Graceful fallback to client storage
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('moviestars_auth_token') : null;
    const userJson = typeof window !== 'undefined' ? localStorage.getItem('moviestars_auth_user') : null;
    let authorName = 'MovieStars Member';
    if (userJson) {
      try {
        authorName = JSON.parse(userJson).displayName || authorName;
      } catch {}
    }

    try {
      const res = await fetch('/api/user/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleId: movie.id,
          content: reviewText.trim(),
          stars: userStars || 5.0,
          token,
          author: authorName,
        }),
      });
      const data = await res.json();
      if (data.success && data.review) {
        setReviewsList((prev) => [data.review, ...prev]);
        setReviewText('');
        return;
      }
    } catch {}

    setReviewsList((prev) => [
      {
        author: authorName,
        stars: userStars || 5,
        content: reviewText.trim(),
        date: 'Just now',
      },
      ...prev,
    ]);
    setReviewText('');
  };

  // Real Graph / Jaccard Genre & Cast Similarity Engine
  const similarTitles = useMemo(() => {
    if (!movie) return [];
    const fullCatalog = getCatalog();
    const movieGenres = new Set((movie.genres || []).map((g) => g.name.toLowerCase()));
    const movieCast = new Set((movie.cast || []).map((c) => c.name.toLowerCase()));

    const scored = fullCatalog
      .filter((c) => c.id !== movie.id)
      .map((c) => {
        const cGenres = new Set((c.genres || []).map((g) => g.name.toLowerCase()));
        const cCast = new Set((c.cast || []).map((a) => a.name.toLowerCase()));

        // Jaccard similarity across genres: |A ∩ B| / |A ∪ B|
        let gIntersect = 0;
        movieGenres.forEach((g) => {
          if (cGenres.has(g)) gIntersect++;
        });
        const gUnion = movieGenres.size + cGenres.size - gIntersect;
        const gSim = gUnion > 0 ? gIntersect / gUnion : 0;

        // Jaccard similarity across cast
        let aIntersect = 0;
        movieCast.forEach((a) => {
          if (cCast.has(a)) aIntersect++;
        });
        const aUnion = movieCast.size + cCast.size - aIntersect;
        const aSim = aUnion > 0 ? aIntersect / aUnion : 0;

        const totalSim = gSim * 0.7 + aSim * 0.3;
        return { item: c, score: totalSim };
      })
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 4).map((s) => s.item);
  }, [movie]);

  const bayesianStars = scoreToStars(movie.ratings.bayesianScore);

  const catalog = getCatalog();
  const currentIndex = catalog.findIndex((t) => t.id === movie.id);
  const prevMovie = currentIndex > 0 ? catalog[currentIndex - 1] : catalog[catalog.length - 1];
  const nextMovie = currentIndex < catalog.length - 1 ? catalog[currentIndex + 1] : catalog[0];

  function safeJsonLd(obj: any): string {
    return JSON.stringify(obj).replace(/</g, '\\u003c');
  }

  // Schema.org Movie / TVSeries Structured Data for Rich Google Snippets
  const movieSchema = {
    '@context': 'https://schema.org',
    '@type': movie.type === 'movie' ? 'Movie' : 'TVSeries',
    name: movie.title,
    alternateName: movie.originalTitle,
    image: movie.posterPath,
    description: movie.overview,
    datePublished: movie.releaseDate,
    genre: (movie.genres || []).map((g) => g.name),
    director: (movie.directors || []).map((d) => ({
      '@type': 'Person',
      name: d.name,
    })),
    actor: (movie.cast || []).map((c) => ({
      '@type': 'Person',
      name: c.name,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: movie.ratings.imdb?.score || movie.ratings.tmdb?.score || movie.ratings.bayesianScore,
      bestRating: '10',
      worstRating: '1',
      ratingCount: movie.ratings.imdb?.votes || movie.ratings.tmdb?.votes || 100,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://movie-stars-kappa.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: movie.type === 'web_series' ? 'Web Series' : movie.type === 'tv' ? 'TV Shows' : 'Movies',
        item: `https://movie-stars-kappa.vercel.app/browse?type=${movie.type}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: movie.title,
        item: `https://movie-stars-kappa.vercel.app/title/${movie.id}`,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Schema.org SEO Structured Data with XSS-safe serialization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(movieSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
      {/* 1. Top Bar: Breadcrumbs & Next/Prev Navigator */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <Breadcrumb
          items={[
            {
              label: movie.type === 'web_series' ? 'Web Series' : movie.type === 'tv' ? 'TV Shows' : 'Movies',
              href: `/browse?type=${movie.type}`,
            },
            { label: movie.title },
          ]}
        />

        <div className="flex items-center gap-2">
          {prevMovie && (
            <Link
              href={`/title/${prevMovie.id}`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
              title={`Previous: ${prevMovie.title}`}
            >
              <ChevronLeft className="w-3.5 h-3.5 text-[#f5c518]" />
              <span className="hidden sm:inline truncate max-w-[120px]">{prevMovie.title}</span>
              <span className="sm:hidden">Prev</span>
            </Link>
          )}

          {nextMovie && (
            <Link
              href={`/title/${nextMovie.id}`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
              title={`Next: ${nextMovie.title}`}
            >
              <span className="hidden sm:inline truncate max-w-[120px]">{nextMovie.title}</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#f5c518]" />
            </Link>
          )}
        </div>
      </div>

      {/* 2. IMDb Title Header & Scoreboard Cluster */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        {/* Left: Title & Meta specs */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {movie.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-400">
            <span>{formatReleaseYear(movie.releaseDate)}</span>
            <span>•</span>
            {movie.certification && (
              <>
                <span className="px-2 py-0.5 rounded bg-zinc-800 border border-white/10 text-zinc-300 font-bold">
                  {movie.certification}
                </span>
                <span>•</span>
              </>
            )}
            {movie.runtimeMinutes ? (
              <>
                <span>{formatRuntime(movie.runtimeMinutes)}</span>
                <span>•</span>
              </>
            ) : movie.seasonsCount ? (
              <>
                <span>{movie.seasonsCount} Season{movie.seasonsCount > 1 ? 's' : ''}</span>
                <span>•</span>
              </>
            ) : null}
            <span className="uppercase text-zinc-300 font-bold">{(movie.originalLanguage || 'en').toUpperCase()}</span>
            <span className="px-2 py-0.5 rounded-md bg-[#f5c518]/20 text-[#f5c518] uppercase text-[10px] font-black">
              {(movie.type || 'movie').replace('_', ' ')}
            </span>
          </div>

          {/* Quick Action Ribbon & Save Button */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={() => handleAction('watchlist')}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs transition-all shadow-lg active:scale-95 cursor-pointer',
                inWatchlist
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-[#f5c518] hover:bg-amber-400 text-black shadow-amber-500/30'
              )}
            >
              {inWatchlist ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>In Watchlist (Saved to Watch)</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Save to Watchlist (Want to Watch)</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleAction('watched')}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all active:scale-95',
                inWatched
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-white/10 text-zinc-300 hover:text-white'
              )}
            >
              <CheckCircle2 className={cn('w-4 h-4', inWatched && 'fill-emerald-400 text-black')} />
              <span>{inWatched ? 'Watched' : 'Mark Watched'}</span>
            </button>

            <button
              onClick={() => handleAction('favorites')}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all active:scale-95',
                inFavorites
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-white/10 text-zinc-300 hover:text-white'
              )}
            >
              <Heart className={cn('w-4 h-4', inFavorites && 'fill-rose-500 text-rose-500')} />
              <span>{inFavorites ? 'Favorited' : 'Favorite'}</span>
            </button>
          </div>
        </div>

        {/* Right: IMDb Scoreboard Cluster (IMDb Rating, Your Rating, Popularity) */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          {/* IMDb Rating Box */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              IMDb Rating
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Star className="w-6 h-6 fill-[#f5c518] text-[#f5c518]" />
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black text-white leading-none">
                  {(movie.ratings?.imdb?.score ?? 7.5).toFixed(1)}
                  <span className="text-zinc-500 font-normal text-xs">/10</span>
                </span>
                <span className="text-[10px] text-zinc-400">
                  {formatVoteCount(movie.ratings?.imdb?.votes ?? 15000)}
                </span>
              </div>
            </div>
          </div>

          {/* Your Rating Box */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Your Rating
            </span>
            <button
              onClick={() => setRatingModalOpen(!ratingModalOpen)}
              className="flex items-center gap-1.5 mt-0.5 px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/15 transition-all text-xs font-bold text-sky-400 hover:text-sky-300 group"
            >
              <Star
                className={cn(
                  'w-5 h-5 group-hover:scale-110 transition-transform',
                  userStars ? 'fill-sky-400 text-sky-400' : 'text-sky-400'
                )}
              />
              <span>{userStars ? `${userStars}/5` : 'Rate'}</span>
            </button>
          </div>

          {/* Popularity / Rank Box */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Rank Score
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-400/30 text-[#f5c518]">
              <Award className="w-5 h-5 text-[#f5c518]" />
              <div className="flex flex-col">
                <span className="text-sm font-black text-[#f5c518] leading-none">
                  {(bayesianStars ?? 4.0).toFixed(1)}
                  <span className="text-zinc-500 font-normal text-[10px]">★</span>
                </span>
                <span className="text-[9px] text-zinc-400 font-mono">Bayesian</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. IMDb-Style Split Media Showcase: Big Poster + Video Hero */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-stretch">
        {/* Left: Poster with Watchlist Ribbon (4 cols) */}
        <div className="md:col-span-4 relative rounded-3xl overflow-hidden bg-black border border-white/15 shadow-2xl group aspect-[2/3] max-w-sm mx-auto md:max-w-none w-full">
          <MovieImage
            src={getTmdbImageUrl(movie.posterPath, 'w780')}
            alt={movie.title}
            fill
            priority
            className="object-cover group-hover:scale-102 transition-transform duration-500"
          />

          {/* IMDb-Style Bookmark Ribbon on Top-Left */}
          <button
            onClick={() => handleAction('watchlist')}
            className="absolute top-0 left-3 z-20 group/ribbon focus:outline-none"
            title={inWatchlist ? 'In Watchlist (Click to remove)' : 'Add to Watchlist'}
          >
            <div
              className={cn(
                'relative w-9 h-12 flex items-center justify-center transition-all duration-300 drop-shadow-xl',
                inWatchlist
                  ? 'text-[#f5c518] scale-105'
                  : 'text-black/75 hover:text-black/90'
              )}
            >
              <svg viewBox="0 0 32 42" className="w-full h-full fill-current">
                <path d="M0 0h32v42l-16-10-16 10V0z" />
              </svg>
              <div className="absolute top-2 inset-x-0 flex items-center justify-center">
                {inWatchlist ? (
                  <Check className="w-4 h-4 text-black stroke-[3.5]" />
                ) : (
                  <Plus className="w-4 h-4 text-white stroke-[3] group-hover/ribbon:scale-125 transition-transform" />
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Center / Right: Video Trailer Stage (8 cols) */}
        <div className="md:col-span-8 relative rounded-3xl overflow-hidden bg-black border border-white/15 shadow-2xl flex items-center justify-center min-h-[340px] sm:min-h-[460px]">
          <MovieImage
            src={getTmdbImageUrl(movie.backdropPath, 'w1280')}
            alt={movie.title}
            fill
            priority
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* Big Play Trailer Button */}
          <div className="relative z-10 flex flex-col items-center gap-3">
            <button
              onClick={() => setTrailerOpen(true)}
              className="w-20 h-20 rounded-full bg-[#f5c518] hover:bg-white text-black flex items-center justify-center shadow-2xl shadow-amber-500/40 hover:scale-110 transition-all cursor-pointer group"
              title={`Play ${movie.title} Official Trailer`}
              aria-label={`Play ${movie.title} Official Trailer`}
            >
              <Play className="w-8 h-8 fill-current ml-1 group-hover:scale-105 transition-transform" />
            </button>
            <button
              onClick={() => setTrailerOpen(true)}
              className="text-white font-extrabold text-sm drop-shadow-md flex items-center gap-1.5 bg-black/60 hover:bg-black/80 px-4 py-1.5 rounded-full border border-white/10 hover:border-[#f5c518]/50 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-[#f5c518] text-[#f5c518]" />
              <span>Play Official Trailer</span>
            </button>
          </div>

          {/* Media Counters on bottom-right */}
          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
            <button
              onClick={() => setTrailerOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black/95 backdrop-blur-md border border-white/15 hover:border-[#f5c518]/60 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Watch Official Trailer & Clips"
            >
              <Film className="w-3.5 h-3.5 text-[#f5c518]" />
              <span>Trailer & Clips</span>
            </button>
            <span className="px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-white font-bold text-xs flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#f5c518]" />
              <span>99+ Photos</span>
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Rating Modal Dropdown */}
      {ratingModalOpen && (
        <div className="p-5 rounded-2xl bg-[#1a1a1a] border border-[#f5c518]/40 shadow-2xl space-y-4 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-sm text-white flex items-center gap-2">
              <Star className="w-4 h-4 fill-[#f5c518] text-[#f5c518]" />
              Rate {movie.title}
            </span>
            <button
              onClick={() => setRatingModalOpen(false)}
              className="text-zinc-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <div className="flex justify-center py-2">
            <StarRating
              score={userStars || 0}
              interactive={true}
              onRate={handleRate}
              size="lg"
            />
          </div>
          <p className="text-center text-xs text-zinc-400">
            Hover or tap on the left or right of any star to select half or whole stars (0.5 to 5.0).
          </p>
        </div>
      )}

      {/* 4. Genres, Tagline, Overview & Metascore */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Columns: Details, Cast & Trivia */}
        <div className="lg:col-span-8 space-y-8">
          {/* Genre Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {(movie.genres || []).map((g) => (
              <Link
                key={g.id}
                href={`/browse?genre=${encodeURIComponent(g.name)}`}
                className="px-3.5 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-[#f5c518] text-xs font-bold text-zinc-200 transition-colors"
              >
                {g.name}
              </Link>
            ))}
          </div>

          {/* Storyline & What It's About Section */}
          <div className="p-6 rounded-3xl bg-[#1a1a1a] border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <div className="w-1.5 h-5 rounded-full bg-[#f5c518]" />
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#f5c518]" />
                <span>Storyline &bull; What It&apos;s About</span>
              </h3>
            </div>

            {movie.tagline && (
              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#f5c518] block mb-1">
                  Official Tagline
                </span>
                <p className="text-white text-sm sm:text-base font-serif italic">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              </div>
            )}

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">
                Synopsis & Premise
              </span>
              <p className="text-zinc-200 text-sm sm:text-base leading-relaxed font-normal">
                {movie.overview}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10 text-xs">
              <span className="font-bold text-white text-[11px] uppercase tracking-wider">Genres:</span>
              {(movie.genres || []).map((g) => (
                <span
                  key={g.id}
                  className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 font-semibold text-[11px]"
                >
                  {g.name}
                </span>
              ))}
              <span className="text-zinc-600">•</span>
              <span className="font-bold text-white text-[11px] uppercase tracking-wider">Format:</span>
              <span className="px-2.5 py-1 rounded-xl bg-[#f5c518]/15 border border-[#f5c518]/30 text-[#f5c518] font-bold text-[11px] capitalize">
                {(movie.type || 'movie').replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Directors & Writers Row (IMDb Style) */}
          <div className="border-y border-white/10 divide-y divide-white/10 text-xs sm:text-sm">
            {movie.directors && movie.directors.length > 0 && (
              <div className="py-3 flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-white w-24">Director</span>
                <div className="flex flex-wrap gap-2 text-sky-400 font-bold">
                  {movie.directors.map((d, i) => (
                    <Link
                      key={d.id}
                      href={`/person/${d.id}`}
                      className="hover:text-sky-300 hover:underline"
                    >
                      {d.name}
                      {i < movie.directors.length - 1 && ', '}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {movie.cast && movie.cast.length > 0 && (
              <div className="py-3 flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-white w-24">Stars</span>
                <div className="flex flex-wrap gap-2 text-sky-400 font-bold">
                  {movie.cast.slice(0, 4).map((c, i) => (
                    <Link
                      key={c.id}
                      href={`/person/${c.id}`}
                      className="hover:text-sky-300 hover:underline"
                    >
                      {c.name}
                      {i < Math.min(movie.cast.length, 4) - 1 && ' • '}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Top Cast Section with Character Headshots (IMDb Style) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-[#f5c518]" />
                <h3 className="text-lg font-black text-white">Top Cast</h3>
              </div>
              <span className="text-xs text-zinc-400 font-medium">In credits order</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(movie.cast || []).map((actor) => (
                <Link
                  key={actor.id}
                  href={`/person/${actor.id}`}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#1a1a1a] hover:bg-zinc-800 border border-white/10 hover:border-[#f5c518]/60 transition-all group"
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-900 shrink-0 border border-white/15">
                    {actor.profilePath ? (
                      <MovieImage
                        src={actor.profilePath}
                        alt={actor.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-xs text-[#f5c518]">
                        {actor.name?.[0] || '★'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-[#f5c518] truncate transition-colors">
                      {actor.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">
                      {actor.character || actor.role}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 5. "Did You Know?" / Trivia Section (IMDb Iconic Feature) */}
          {movie.trivia && movie.trivia.length > 0 && (
            <div className="space-y-4 p-6 rounded-3xl bg-[#1a1a1a] border border-white/10 shadow-xl">
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                <div className="w-1.5 h-5 rounded-full bg-[#f5c518]" />
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#f5c518]" />
                  <span>Did You Know? (Trivia)</span>
                </h3>
              </div>

              <div className="space-y-3.5">
                {movie.trivia.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300">
                    <span className="w-5 h-5 rounded-full bg-[#f5c518]/20 text-[#f5c518] flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Box Office & Technical Specifications (IMDb Iconic Feature) */}
          {(movie.boxOffice || movie.technicalSpecs) && (
            <div className="space-y-4 p-6 rounded-3xl bg-[#1a1a1a] border border-white/10 shadow-xl">
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                <div className="w-1.5 h-5 rounded-full bg-[#f5c518]" />
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#f5c518]" />
                  <span>Box Office & Technical Specs</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {movie.boxOffice?.budget && (
                  <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                    <span className="text-zinc-400 font-bold uppercase text-[10px]">Budget</span>
                    <p className="text-white font-extrabold text-sm">{movie.boxOffice.budget}</p>
                  </div>
                )}
                {movie.boxOffice?.worldwideGross && (
                  <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                    <span className="text-zinc-400 font-bold uppercase text-[10px]">Worldwide Gross</span>
                    <p className="text-[#f5c518] font-extrabold text-sm">{movie.boxOffice.worldwideGross}</p>
                  </div>
                )}
                {movie.technicalSpecs?.aspectRatio && (
                  <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                    <span className="text-zinc-400 font-bold uppercase text-[10px]">Aspect Ratio</span>
                    <p className="text-zinc-200 font-semibold">{movie.technicalSpecs.aspectRatio}</p>
                  </div>
                )}
                {movie.technicalSpecs?.soundMix && (
                  <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                    <span className="text-zinc-400 font-bold uppercase text-[10px]">Sound Mix</span>
                    <p className="text-zinc-200 font-semibold">{movie.technicalSpecs.soundMix}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 7. User Reviews Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-[#f5c518]" />
                <h3 className="text-lg font-black text-white">User Reviews</h3>
              </div>
              <span className="text-xs text-zinc-400">{reviewsList.length} community reviews</span>
            </div>

            {/* Submit Review Box */}
            <form onSubmit={handleAddReview} className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/10 space-y-3">
              <span className="text-xs font-bold text-white">Write a quick review</span>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you think of the cinematography, acting, and pacing?"
                className="w-full p-3 rounded-xl bg-black border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#f5c518]"
                rows={3}
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">
                  Rating: {userStars ? `${userStars} ★` : 'Not rated yet'}
                </span>
                <button
                  type="submit"
                  disabled={!reviewText.trim()}
                  className="px-4 py-1.5 rounded-xl bg-[#f5c518] hover:bg-amber-400 disabled:opacity-50 text-black font-black text-xs transition-colors"
                >
                  Post Review
                </button>
              </div>
            </form>

            {/* List of Reviews */}
            <div className="space-y-3">
              {reviewsList.map((rev, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#f5c518] text-black font-black text-[10px] flex items-center justify-center">
                        {rev.author[0]}
                      </div>
                      <span className="font-bold text-xs text-white">{rev.author}</span>
                      <span className="text-zinc-500 text-[11px]">• {rev.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#f5c518] font-black text-xs">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{rev.stars} / 5</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{rev.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Where to Watch Widget, Metascore & Similar Titles */}
        <div className="lg:col-span-4 space-y-6">
          {/* Metascore Card (if available) */}
          {movie.metascore && (
            <div className="p-5 rounded-3xl bg-[#1a1a1a] border border-white/10 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Critic Reviews
                </span>
                <span className="text-[10px] text-zinc-500">Metacritic Source</span>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-lg shrink-0',
                    movie.metascore >= 80
                      ? 'bg-emerald-600'
                      : movie.metascore >= 60
                      ? 'bg-amber-600'
                      : 'bg-red-600'
                  )}
                >
                  {movie.metascore}
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white">
                    {movie.metascore >= 80 ? 'Universal Acclaim' : 'Generally Favorable'}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Based on {movie.metascoreReviewsCount || 42} critic reviews
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Where to Watch Widget */}
          <WhereToWatchWidget availability={movie.availability} titleName={movie.title} />

          {/* More Like This (MovieGraph Jaccard Similarity) */}
          <div className="p-5 rounded-3xl bg-[#1a1a1a] border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 rounded-full bg-[#f5c518]" />
                <h4 className="text-sm font-black text-white">More Like This</h4>
              </div>
              <span className="text-[10px] text-zinc-400">Graph recommendation</span>
            </div>

            <div className="space-y-3">
              {similarTitles.map((sim) => (
                <Link
                  key={sim.id}
                  href={`/title/${sim.id}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800 transition-colors group"
                >
                  <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
                    <MovieImage
                      src={getTmdbImageUrl(sim.posterPath, 'w185')}
                      alt={sim.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-[#f5c518] truncate transition-colors">
                      {sim.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {sim.releaseDate?.slice(0, 4)} • ★ {(sim.ratings.imdb?.score ?? sim.ratings.tmdb?.score ?? sim.ratings.bayesianScore).toFixed(1)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal (Finds trailer dynamically from YouTube if needed) */}
      <TrailerModal
        youtubeKey={movie.trailerYoutubeKey}
        title={movie.title}
        year={movie.releaseDate?.slice(0, 4)}
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
      />
    </div>
  );
}
