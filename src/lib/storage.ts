'use client';

import { WatchlistState } from '@/types/movie';

const STORAGE_KEY = 'moviestars_user_state';
const COUNTRY_KEY = 'moviestars_selected_country';

const DEFAULT_STATE: WatchlistState = {
  watchlist: ['oppenheimer-2023', 'avengers-secret-wars-2027'],
  watched: ['the-godfather-1972', 'interstellar-2014'],
  favorites: ['the-shawshank-redemption-1994', 'breaking-bad-2008'],
  reminders: ['avengers-secret-wars-2027', 'kalki-2-2026'],
  userRatings: {
    'oppenheimer-2023': 4.5,
    'the-godfather-1972': 5.0,
    'the-shawshank-redemption-1994': 5.0,
    'dune-part-two-2024': 4.5,
  },
  userReviews: {},
};

export function getClientState(): WatchlistState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
      return DEFAULT_STATE;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveClientState(state: WatchlistState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('moviestars_state_updated'));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

export function isItemInList(
  titleId: string,
  listKey: 'watchlist' | 'watched' | 'favorites' | 'reminders'
): boolean {
  const current = getClientState();
  return current[listKey].includes(titleId);
}

export function toggleListStatus(
  titleId: string,
  listKey: 'watchlist' | 'watched' | 'favorites' | 'reminders',
  movieTitle?: string
): boolean {
  const current = getClientState();
  const list = current[listKey];
  const exists = list.includes(titleId);

  const updated = exists ? list.filter((id) => id !== titleId) : [...list, titleId];
  current[listKey] = updated;

  saveClientState(current);

  // Dispatch toast event with metadata
  if (typeof window !== 'undefined') {
    const actionLabel =
      listKey === 'watchlist'
        ? exists
          ? 'Removed from Watchlist'
          : 'Saved to Watchlist (Want to Watch)'
        : listKey === 'watched'
        ? exists
          ? 'Unmarked as Watched'
          : 'Marked as Watched'
        : listKey === 'favorites'
        ? exists
          ? 'Removed from Favorites'
          : 'Added to Favorites'
        : exists
        ? 'Reminder Cancelled'
        : 'Reminder Set';

    window.dispatchEvent(
      new CustomEvent('moviestars_toast', {
        detail: {
          titleId,
          movieTitle: movieTitle || titleId,
          listKey,
          active: !exists,
          label: actionLabel,
        },
      })
    );
  }

  return !exists;
}

export function setUserStarRating(titleId: string, stars: number) {
  const current = getClientState();
  current.userRatings[titleId] = stars;
  saveClientState(current);
}

export function clearList(listKey: 'watchlist' | 'watched' | 'favorites' | 'reminders') {
  const current = getClientState();
  current[listKey] = [];
  saveClientState(current);
}

export function getSelectedCountry(): string {
  if (typeof window === 'undefined') return 'IN';
  try {
    return localStorage.getItem(COUNTRY_KEY) || 'IN';
  } catch {
    return 'IN';
  }
}

export function setSelectedCountry(countryCode: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COUNTRY_KEY, countryCode);
    window.dispatchEvent(new Event('moviestars_country_updated'));
  } catch (e) {
    console.error(e);
  }
}
