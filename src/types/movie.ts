export type TitleType = 'movie' | 'tv' | 'web_series';

export type TitleStatus = 'upcoming' | 'released' | 'in_production';

export type OfferType = 'stream' | 'rent' | 'buy';

export interface Genre {
  id: number;
  name: string;
}

export interface Person {
  id: number;
  name: string;
  role: 'actor' | 'director' | 'writer' | 'creator';
  character?: string;
  profilePath?: string;
}

export interface WatchProvider {
  id: number;
  name: string;
  logoPath: string;
  displayPriority: number;
}

export interface Availability {
  provider: WatchProvider;
  offerType: OfferType;
  streamUrl?: string;
}

export interface RegionAvailability {
  countryCode: string; // 'IN', 'US', 'GB', etc.
  countryName: string;
  stream: Availability[];
  rent: Availability[];
  buy: Availability[];
}

export interface RatingBreakdown {
  imdb: {
    score: number; // e.g., 8.9 (out of 10)
    votes: number;
  };
  tmdb: {
    score: number; // e.g., 8.4 (out of 10)
    votes: number;
  };
  userCommunity: {
    score: number; // 0.5 to 5.0
    votes: number;
  };
  bayesianScore: number; // 0.0 to 10.0 (and converted to 5-star equivalent)
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  title: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface TitleItem {
  id: string; // Internal UUID or slug
  tmdbId: number;
  imdbId: string;
  type: TitleType;
  title: string;
  originalTitle?: string;
  overview: string;
  releaseDate: string; // ISO format: 'YYYY-MM-DD'
  runtimeMinutes?: number;
  seasonsCount?: number;
  episodesCount?: number;
  status: TitleStatus;
  originalLanguage: string;
  posterPath: string;
  backdropPath: string;
  genres: Genre[];
  cast: Person[];
  directors: Person[];
  trailerYoutubeKey?: string;
  ratings: RatingBreakdown;
  availability: Record<string, RegionAvailability>; // keyed by ISO country code e.g. 'IN'
  popularity: number;
  certification?: string; // e.g., 'U/A 16+', 'PG-13', 'R'
  tagline?: string;
  // IMDb-style rich metadata additions
  metascore?: number;
  metascoreReviewsCount?: number;
  trivia?: string[];
  boxOffice?: {
    budget?: string;
    worldwideGross?: string;
    openingWeekend?: string;
  };
  technicalSpecs?: {
    aspectRatio?: string;
    soundMix?: string;
    camera?: string;
    laboratory?: string;
  };
  trendingRank?: number; // 1-10 ranking this week
}

export interface Celebrity {
  id: number;
  name: string;
  birthDate: string;
  age: number;
  knownFor: string;
  role: string;
  profilePath: string;
  topTitles: string[];
}

export interface FilterOptions {
  type: 'all' | TitleType;
  genre: string;
  language: string;
  year: string;
  ratingMin: number;
  provider: string;
  country: string;
  sortBy: 'bayesian' | 'popularity' | 'releaseDate' | 'votes' | 'title';
  searchQuery?: string;
}

export interface UserRatingSubmission {
  titleId: string;
  stars: number; // 0.5 to 5.0
  reviewText?: string;
  reviewTitle?: string;
  timestamp: string;
}

export interface WatchlistState {
  watchlist: string[]; // title IDs
  watched: string[];
  favorites: string[];
  reminders: string[]; // upcoming release notification subscribed
  userRatings: Record<string, number>; // titleId -> stars
  userReviews: Record<string, Review>;
}

