import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { BackToTop } from '@/components/BackToTop';
import { WatchlistToast } from '@/components/WatchlistToast';
import { TrendingMarquee } from '@/components/TrendingMarquee';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://moviestars.vercel.app';

export const viewport: Viewport = {
  themeColor: '#06080d',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'MovieStars — Cinema Intelligence, Bayesian Star Ratings & Where to Watch',
    template: '%s | MovieStars',
  },
  description:
    'An elevated, ad-free cinema intelligence platform inspired by IMDb, Letterboxd, and Apple TV+. Discover 11,200,000+ global movies, TV shows, and web series, Bayesian Top 250 leaderboards, Where to Watch streaming availability in 180+ countries, and personalized Want to Watch libraries.',
  keywords: [
    'movies',
    'tv shows',
    'web series',
    'where to watch',
    'streaming availability',
    'netflix',
    'amazon prime video',
    'disney hotstar',
    'jiocinema',
    'apple tv',
    'imdb top 250',
    'bayesian rating formula',
    'cinema intelligence',
    'movie trivia',
    'metascore',
    'upcoming movie countdowns',
    'hollywood',
    'bollywood',
    'anime',
  ],
  authors: [{ name: 'MovieStars Engineering' }],
  creator: 'MovieStars',
  publisher: 'MovieStars',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MovieStars — Cinema Intelligence, Bayesian Star Ratings & Where to Watch',
    description:
      'Elevated cinema intelligence covering 11.2M+ global movies and TV series, Bayesian Top 250 ratings, and streaming availability across 180+ countries.',
    url: APP_URL,
    siteName: 'MovieStars',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://image.tmdb.org/t/p/w1280/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
        width: 1280,
        height: 720,
        alt: 'MovieStars Cinema Intelligence Banner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MovieStars — Cinema Intelligence & Where to Watch',
    description:
      'Discover 11.2M+ movies and TV series with Bayesian Top 250 weighted rankings and streaming availability in 180+ countries.',
    images: ['https://image.tmdb.org/t/p/w1280/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg'],
    creator: '@moviestars',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Schema.org Structured Data for Google Sitelinks Searchbox & Organization
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${APP_URL}/#website`,
        url: APP_URL,
        name: 'MovieStars',
        description: 'Cinema Intelligence, Bayesian Star Ratings & Where to Watch Worldwide',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${APP_URL}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${APP_URL}/#organization`,
        name: 'MovieStars',
        url: APP_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${APP_URL}/favicon.ico`,
        },
      },
    ],
  };

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        {/* Preconnect & DNS Prefetch to Edge Media CDNs for Sub-Millisecond Asset Delivery */}
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://m.media-amazon.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://m.media-amazon.com" />
        <link rel="preconnect" href="https://img.youtube.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://img.youtube.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-cinema-dark text-zinc-100 antialiased selection:bg-[#f5c518] selection:text-black pb-16 lg:pb-0">
        <TrendingMarquee />
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <Footer />
        <MobileBottomNav />
        <BackToTop />
        <WatchlistToast />
      </body>
    </html>
  );
}
