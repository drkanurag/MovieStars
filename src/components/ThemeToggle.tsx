'use client';

import React, { useState, useEffect } from 'react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('moviestars_theme') as 'dark' | 'light' | null;
    if (saved) {
      setTheme(saved);
      if (saved === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('moviestars_theme', next);

    if (next === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }

    window.dispatchEvent(new Event('moviestars_theme_updated'));
  };

  if (!mounted) {
    return (
      <button
        type="button"
        className={`p-2 rounded bg-surface-card border border-surface-border text-text-secondary hover:text-amber-gold transition-colors ${className}`}
        aria-label="Toggle theme"
      >
        <span className="material-symbols-outlined text-lg">dark_mode</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded bg-surface-card border border-surface-border text-text-secondary hover:text-amber-gold transition-all duration-200 active:scale-95 ${className}`}
      title={`Switch to ${theme === 'dark' ? 'Light Mode' : 'Dark Mode'}`}
      aria-label={`Switch to ${theme === 'dark' ? 'Light Mode' : 'Dark Mode'}`}
    >
      <span className="material-symbols-outlined text-lg">
        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}

