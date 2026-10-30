'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Mail, Lock, User as UserIcon, LogIn, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isSignUp ? '/api/gateway/user/register' : '/api/gateway/user/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      // Save token in localStorage
      localStorage.setItem('moviestars_auth_token', json.data.token);
      localStorage.setItem('moviestars_auth_user', JSON.stringify(json.data.user));
      window.dispatchEvent(new Event('moviestars_auth_updated'));
      router.push('/');
    } catch {
      setError('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleMock = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gateway/user/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'google.user@example.com',
          displayName: 'Google Explorer',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        }),
      });
      const json = await res.json();
      localStorage.setItem('moviestars_auth_token', json.data.token);
      localStorage.setItem('moviestars_auth_user', JSON.stringify(json.data.user));
      window.dispatchEvent(new Event('moviestars_auth_updated'));
      router.push('/');
    } catch {
      setError('Google Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-cinema-card border border-cinema-border rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-10 h-10 rounded-xl bg-cinema-gold text-black items-center justify-center font-black">
            <Star className="w-5 h-5 fill-black" />
          </div>
          <h1 className="text-2xl font-black text-white">
            {isSignUp ? 'Create your Account' : 'Welcome to MovieStars'}
          </h1>
          <p className="text-xs text-zinc-400">
            {isSignUp
              ? 'Join to rate movies with stars, save watchlists, and get release reminders'
              : 'Sign in to access your ratings, watchlists, and custom reviews'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isSignUp && (
            <div>
              <label className="block text-zinc-400 font-semibold mb-1">Display Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. CinemaLover"
                  className="w-full bg-cinema-elevated border border-cinema-border rounded-xl pl-9 pr-3 py-2 text-white outline-none focus:border-cinema-gold"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-zinc-400 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-cinema-elevated border border-cinema-border rounded-xl pl-9 pr-3 py-2 text-white outline-none focus:border-cinema-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-cinema-elevated border border-cinema-border rounded-xl pl-9 pr-3 py-2 text-white outline-none focus:border-cinema-gold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-cinema-gold hover:bg-cinema-goldHover text-black font-bold text-xs shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
          </button>
        </form>

        <div className="relative text-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-cinema-border" />
          </div>
          <span className="relative bg-cinema-card px-2 text-[11px] text-zinc-500 uppercase">
            or continue with
          </span>
        </div>

        <button
          onClick={handleGoogleMock}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="text-center text-xs text-zinc-400">
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="text-cinema-gold font-bold hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="text-cinema-gold font-bold hover:underline"
              >
                Sign Up
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

