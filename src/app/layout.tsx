import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { BackToTop } from '@/components/BackToTop';
import { WatchlistToast } from '@/components/WatchlistToast';

export const metadata: Metadata = {
  title: 'MovieStars — Ratings, Upcoming Releases & Where to Watch',
  description: 'Discover upcoming movies, countdowns, Bayesian weighted star ratings, trailers, and where to stream titles on Netflix, Prime Video, Hotstar, JioCinema and more.',
  keywords: ['movies', 'tv shows', 'web series', 'where to watch', 'netflix', 'prime video', 'hotstar', 'imdb rating', 'bayesian rank', 'upcoming movies countdown'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-cinema-dark text-zinc-100 antialiased selection:bg-cinema-gold selection:text-black pb-16 lg:pb-0">
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
