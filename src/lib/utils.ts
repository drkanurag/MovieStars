import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "TBA";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatRuntime(minutes?: number): string {
  if (!minutes || minutes <= 0) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getDaysUntil(dateString: string): {
  days: number;
  hours: number;
  isReleased: boolean;
  text: string;
} {
  const target = new Date(dateString).getTime();
  const now = new Date().getTime();
  const diffMs = target - now;

  if (diffMs <= 0) {
    return { days: 0, hours: 0, isReleased: true, text: "Now in Theaters / Released" };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days === 0) {
    return { days, hours, isReleased: false, text: `Releasing in ${hours}h` };
  }
  return { days, hours, isReleased: false, text: `${days} days to go` };
}

export function formatVoteCount(votes: number): string {
  if (!votes || votes < 0) return "0";
  if (votes >= 1_000_000) {
    return `${(votes / 1_000_000).toFixed(1)}M`;
  }
  if (votes >= 1_000) {
    return `${(votes / 1_000).toFixed(1)}K`;
  }
  return votes.toLocaleString();
}

export function getTmdbImageUrl(
  path?: string,
  size: 'w92' | 'w185' | 'w300' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500'
): string {
  if (!path) return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80";
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
