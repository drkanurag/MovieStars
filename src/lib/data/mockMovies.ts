import { TitleItem, Celebrity } from '@/types/movie';
import { calculateBayesianScore } from '../bayesian';

export const INITIAL_MOVIES: TitleItem[] = [
  {
    id: 'oppenheimer-2023',
    tmdbId: 872585,
    imdbId: 'tt15398776',
    type: 'movie',
    title: 'Oppenheimer',
    overview: 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II and the political fallout that followed.',
    releaseDate: '2023-07-21',
    runtimeMinutes: 180,
    status: 'released',
    originalLanguage: 'en',
    posterPath: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
    genres: [
      { id: 18, name: 'Drama' },
      { id: 36, name: 'History' },
    ],
    cast: [
      { id: 2037, name: 'Cillian Murphy', role: 'actor', character: 'J. Robert Oppenheimer', profilePath: 'https://image.tmdb.org/t/p/w185/i81d2JbW3e1w7qFvQ3c0qC6b6cT.jpg' },
      { id: 3223, name: 'Robert Downey Jr.', role: 'actor', character: 'Lewis Strauss', profilePath: 'https://image.tmdb.org/t/p/w185/5qHNjhtjMD4YWH3fq0lZMBv97vK.jpg' },
      { id: 5081, name: 'Emily Blunt', role: 'actor', character: 'Kitty Oppenheimer', profilePath: 'https://image.tmdb.org/t/p/w185/nPJXaRMAB2zs9i3Q8w5vX1bK65h.jpg' },
      { id: 1892, name: 'Matt Damon', role: 'actor', character: 'Leslie Groves', profilePath: 'https://image.tmdb.org/t/p/w185/elSlNg0W21xap2Tvl42G0Bw1uL0.jpg' },
    ],
    directors: [{ id: 525, name: 'Christopher Nolan', role: 'director' }],
    trailerYoutubeKey: 'uYPbbksJxIg',
    popularity: 92.4,
    certification: 'R',
    tagline: 'The world forever changes.',
    metascore: 88,
    metascoreReviewsCount: 69,
    trendingRank: 1,
    boxOffice: {
      budget: '$100,000,000',
      worldwideGross: '$957,800,000',
      openingWeekend: '$82,455,420 (US)',
    },
    technicalSpecs: {
      aspectRatio: '2.20 : 1 (5-perf 70mm), 1.43 : 1 (IMAX 15-perf 70mm)',
      soundMix: 'Datasat, Dolby Digital, IMAX 6-Track',
      camera: 'IMAX MKIV, IMAX MSM 9802, Panavision 65 HR',
      laboratory: 'FotoKem Laboratory, Burbank (CA), USA',
    },
    trivia: [
      'Christopher Nolan utilized zero computer-generated imagery (CGI) for the Trinity nuclear test sequence, creating practical explosions with magnesium, propane, and black powder.',
      'Kodak engineered the world’s first ever 65mm black-and-white film stock specifically for the IMAX cameras used on this production.',
      'Cillian Murphy read the Bhagavad Gita in Sanskrit preparation for the philosophical reflections of Oppenheimer.',
    ],
    ratings: {
      imdb: { score: 8.9, votes: 810000 },
      tmdb: { score: 8.1, votes: 9400 },
      userCommunity: { score: 4.6, votes: 420 },
      bayesianScore: calculateBayesianScore(810000, 8.9),
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 119, name: 'Amazon Prime Video', logoPath: 'https://image.tmdb.org/t/p/w92/pvsGg12z0p5k1A01Lp.png', displayPriority: 1 }, offerType: 'stream', streamUrl: 'https://www.primevideo.com' },
          { provider: { id: 220, name: 'JioCinema', logoPath: 'https://image.tmdb.org/t/p/w92/7rw3q.png', displayPriority: 2 }, offerType: 'stream', streamUrl: 'https://www.jiocinema.com' }
        ],
        rent: [
          { provider: { id: 2, name: 'Apple TV', logoPath: 'https://image.tmdb.org/t/p/w92/peURlLlr8jggOwK53fJ5wdQl05y.png', displayPriority: 3 }, offerType: 'rent' },
          { provider: { id: 3, name: 'Google Play Movies', logoPath: 'https://image.tmdb.org/t/p/w92/8z7rC8uIDaTM91X0Z.png', displayPriority: 4 }, offerType: 'rent' },
        ],
        buy: [
          { provider: { id: 2, name: 'Apple TV', logoPath: 'https://image.tmdb.org/t/p/w92/peURlLlr8jggOwK53fJ5wdQl05y.png', displayPriority: 1 }, offerType: 'buy' }
        ],
      },
      US: {
        countryCode: 'US',
        countryName: 'United States',
        stream: [
          { provider: { id: 384, name: 'Peacock Premium', logoPath: 'https://image.tmdb.org/t/p/w92/8vcGC7.png', displayPriority: 1 }, offerType: 'stream' }
        ],
        rent: [{ provider: { id: 2, name: 'Apple TV', logoPath: 'https://image.tmdb.org/t/p/w92/peURlLlr8jggOwK53fJ5wdQl05y.png', displayPriority: 1 }, offerType: 'rent' }],
        buy: [{ provider: { id: 2, name: 'Apple TV', logoPath: 'https://image.tmdb.org/t/p/w92/peURlLlr8jggOwK53fJ5wdQl05y.png', displayPriority: 1 }, offerType: 'buy' }],
      }
    }
  },
  {
    id: 'dune-part-two-2024',
    tmdbId: 693134,
    imdbId: 'tt15239678',
    type: 'movie',
    title: 'Dune: Part Two',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.',
    releaseDate: '2024-03-01',
    runtimeMinutes: 166,
    status: 'released',
    originalLanguage: 'en',
    posterPath: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/uhUO7vQQKvCTfQWubOt5MAKokbL.jpg',
    genres: [
      { id: 878, name: 'Science Fiction' },
      { id: 12, name: 'Adventure' },
    ],
    cast: [
      { id: 1190668, name: 'Timothée Chalamet', role: 'actor', character: 'Paul Atreides', profilePath: 'https://image.tmdb.org/t/p/w185/BE2sdjpgsa2rNTFa66f7ikNVXp.jpg' },
      { id: 505710, name: 'Zendaya', role: 'actor', character: 'Chani', profilePath: 'https://image.tmdb.org/t/p/w185/r3A7ev7QkjvEeVw1v2g.jpg' },
      { id: 934, name: 'Rebecca Ferguson', role: 'actor', character: 'Lady Jessica', profilePath: 'https://image.tmdb.org/t/p/w185/6NRs7N4.jpg' },
      { id: 1373737, name: 'Austin Butler', role: 'actor', character: 'Feyd-Rautha', profilePath: 'https://image.tmdb.org/t/p/w185/dzxv0.jpg' },
    ],
    directors: [{ id: 137427, name: 'Denis Villeneuve', role: 'director' }],
    trailerYoutubeKey: 'Way9Dexny3w',
    popularity: 98.7,
    certification: 'PG-13',
    tagline: 'Long live the fighters.',
    metascore: 79,
    metascoreReviewsCount: 62,
    trendingRank: 2,
    boxOffice: {
      budget: '$190,000,000',
      worldwideGross: '$711,844,358',
      openingWeekend: '$82,505,391 (US)',
    },
    technicalSpecs: {
      aspectRatio: '1.43 : 1 (IMAX GT Laser), 1.90 : 1 (Digital IMAX), 2.39 : 1',
      soundMix: 'Dolby Atmos, IMAX 12-Track',
      camera: 'Arri Alexa LF, Arri Alexa Mini LF',
      laboratory: 'Company 3, Los Angeles',
    },
    trivia: [
      'To film the Giedi Prime arena gladiatorial combat scene in stark infrared, Denis Villeneuve used specialized custom-modified infrared cameras.',
      'Austin Butler trained for 4 months in Kali knife martial arts to portray the vicious Harkonnen na-Baron Feyd-Rautha.',
      'The entire sand worm riding sequence took over 44 days to film with a mechanical rig called the worm simulator.',
    ],
    ratings: {
      imdb: { score: 8.6, votes: 540000 },
      tmdb: { score: 8.2, votes: 5100 },
      userCommunity: { score: 4.7, votes: 620 },
      bayesianScore: calculateBayesianScore(540000, 8.6),
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 220, name: 'JioCinema', logoPath: 'https://image.tmdb.org/t/p/w92/7rw3q.png', displayPriority: 1 }, offerType: 'stream', streamUrl: 'https://www.jiocinema.com' }
        ],
        rent: [
          { provider: { id: 119, name: 'Amazon Prime Video', logoPath: 'https://image.tmdb.org/t/p/w92/pvsGg12z0p5k1A01Lp.png', displayPriority: 1 }, offerType: 'rent' },
          { provider: { id: 2, name: 'Apple TV', logoPath: 'https://image.tmdb.org/t/p/w92/peURlLlr8jggOwK53fJ5wdQl05y.png', displayPriority: 2 }, offerType: 'rent' }
        ],
        buy: [{ provider: { id: 2, name: 'Apple TV', logoPath: 'https://image.tmdb.org/t/p/w92/peURlLlr8jggOwK53fJ5wdQl05y.png', displayPriority: 1 }, offerType: 'buy' }]
      }
    }
  },
  {
    id: 'the-godfather-1972',
    tmdbId: 238,
    imdbId: 'tt0068646',
    type: 'movie',
    title: 'The Godfather',
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son steps in to take charge.',
    releaseDate: '1972-03-14',
    runtimeMinutes: 175,
    status: 'released',
    originalLanguage: 'en',
    posterPath: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
    genres: [
      { id: 18, name: 'Drama' },
      { id: 80, name: 'Crime' }
    ],
    cast: [
      { id: 3084, name: 'Marlon Brando', role: 'actor', character: 'Don Vito Corleone' },
      { id: 1158, name: 'Al Pacino', role: 'actor', character: 'Michael Corleone' },
      { id: 3085, name: 'James Caan', role: 'actor', character: 'Sonny Corleone' },
      { id: 3087, name: 'Robert Duvall', role: 'actor', character: 'Tom Hagen' }
    ],
    directors: [{ id: 1776, name: 'Francis Ford Coppola', role: 'director' }],
    trailerYoutubeKey: 'UaVTIH8mujA',
    popularity: 88.0,
    certification: 'R',
    tagline: 'An offer you cannot refuse.',
    metascore: 100,
    metascoreReviewsCount: 30,
    trendingRank: 3,
    boxOffice: {
      budget: '$6,000,000',
      worldwideGross: '$250,341,816',
      openingWeekend: '$302,393 (Limited)',
    },
    technicalSpecs: {
      aspectRatio: '1.85 : 1',
      soundMix: 'Mono, 5.1 Surround (Remastered)',
      camera: 'Arriflex 35 IIC, Mitchell BNC',
      laboratory: 'Technicolor, Hollywood',
    },
    trivia: [
      'Marlon Brando stuffed his cheeks with cotton balls during his audition, and later wore a custom dental mouthpiece created by a dentist to give Vito Corleone his iconic bulldog jaw.',
      'The cat held by Marlon Brando in the opening scene was a stray found on the studio lot; its purring was so loud it muffled Brando’s dialogue.',
      'The word "mafia" or "mob" is never uttered once in the entire film due to an agreement with the Italian-American Civil Rights League.',
    ],
    ratings: {
      imdb: { score: 9.2, votes: 2000000 },
      tmdb: { score: 8.7, votes: 19800 },
      userCommunity: { score: 4.9, votes: 1850 },
      bayesianScore: calculateBayesianScore(2000000, 9.2),
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 220, name: 'JioCinema', logoPath: 'https://image.tmdb.org/t/p/w92/7rw3q.png', displayPriority: 1 }, offerType: 'stream' },
          { provider: { id: 119, name: 'Amazon Prime Video', logoPath: 'https://image.tmdb.org/t/p/w92/pvsGg12z0p5k1A01Lp.png', displayPriority: 2 }, offerType: 'stream' }
        ],
        rent: [{ provider: { id: 2, name: 'Apple TV', logoPath: 'https://image.tmdb.org/t/p/w92/peURlLlr8jggOwK53fJ5wdQl05y.png', displayPriority: 1 }, offerType: 'rent' }],
        buy: [{ provider: { id: 2, name: 'Apple TV', logoPath: 'https://image.tmdb.org/t/p/w92/peURlLlr8jggOwK53fJ5wdQl05y.png', displayPriority: 1 }, offerType: 'buy' }]
      }
    }
  },
  {
    id: 'the-shawshank-redemption-1994',
    tmdbId: 278,
    imdbId: 'tt0111161',
    type: 'movie',
    title: 'The Shawshank Redemption',
    overview: 'Imprisoned in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden.',
    releaseDate: '1994-09-23',
    runtimeMinutes: 142,
    status: 'released',
    originalLanguage: 'en',
    posterPath: 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    genres: [
      { id: 18, name: 'Drama' },
      { id: 80, name: 'Crime' }
    ],
    cast: [
      { id: 504, name: 'Tim Robbins', role: 'actor', character: 'Andy Dufresne' },
      { id: 192, name: 'Morgan Freeman', role: 'actor', character: 'Ellis Boyd "Red" Redding' },
      { id: 4029, name: 'Bob Gunton', role: 'actor', character: 'Warden Samuel Norton' }
    ],
    directors: [{ id: 4027, name: 'Frank Darabont', role: 'director' }],
    trailerYoutubeKey: 'PLl99DlL6b4',
    popularity: 91.2,
    certification: 'R',
    tagline: 'Fear can hold you prisoner. Hope can set you free.',
    metascore: 82,
    metascoreReviewsCount: 21,
    trendingRank: 4,
    boxOffice: {
      budget: '$25,000,000',
      worldwideGross: '$58,300,000',
      openingWeekend: '$727,327 (US)',
    },
    technicalSpecs: {
      aspectRatio: '1.85 : 1',
      soundMix: 'Dolby Digital',
      camera: 'Arriflex 35 BL4, Zeiss Lenses',
      laboratory: 'Technicolor',
    },
    trivia: [
      'Morgan Freeman arrived on set with his arm in a sling after throwing a baseball back and forth with Tim Robbins for nine straight hours during the yard interrogation scene.',
      'The mud and sewage Andy crawls through to escape was actually a mixture of water, peat moss, and chocolate syrup.',
      'Stephen King never cashed his $5,000 movie rights check; he framed it and sent it back to Frank Darabont with a note: "In case you ever need bail money."',
    ],
    ratings: {
      imdb: { score: 9.3, votes: 2900000 },
      tmdb: { score: 8.7, votes: 26500 },
      userCommunity: { score: 4.9, votes: 2200 },
      bayesianScore: calculateBayesianScore(2900000, 9.3),
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 8, name: 'Netflix', logoPath: 'https://image.tmdb.org/t/p/w92/9A1JSVmSxsya9w326pxv6m.png', displayPriority: 1 }, offerType: 'stream' }
        ],
        rent: [{ provider: { id: 2, name: 'Apple TV', logoPath: 'https://image.tmdb.org/t/p/w92/peURlLlr8jggOwK53fJ5wdQl05y.png', displayPriority: 1 }, offerType: 'rent' }],
        buy: [{ provider: { id: 2, name: 'Apple TV', logoPath: 'https://image.tmdb.org/t/p/w92/peURlLlr8jggOwK53fJ5wdQl05y.png', displayPriority: 1 }, offerType: 'buy' }]
      }
    }
  },
  {
    id: 'breaking-bad-2008',
    tmdbId: 1396,
    imdbId: 'tt0903747',
    type: 'tv',
    title: 'Breaking Bad',
    overview: 'Walter White, a New Mexico chemistry teacher diagnosed with terminal lung cancer, teams up with former student Jesse Pinkman to manufacture and sell crystal meth to secure his family’s financial future.',
    releaseDate: '2008-01-20',
    seasonsCount: 5,
    episodesCount: 62,
    runtimeMinutes: 47,
    status: 'released',
    originalLanguage: 'en',
    posterPath: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    genres: [
      { id: 18, name: 'Drama' },
      { id: 80, name: 'Crime' }
    ],
    cast: [
      { id: 17419, name: 'Bryan Cranston', role: 'actor', character: 'Walter White' },
      { id: 84497, name: 'Aaron Paul', role: 'actor', character: 'Jesse Pinkman' },
      { id: 134531, name: 'Anna Gunn', role: 'actor', character: 'Skyler White' },
      { id: 14329, name: 'Giancarlo Esposito', role: 'actor', character: 'Gustavo Fring' }
    ],
    directors: [{ id: 66633, name: 'Vince Gilligan', role: 'creator' }],
    trailerYoutubeKey: 'HhesaQXLuRY',
    popularity: 95.8,
    certification: 'TV-MA',
    tagline: 'Remember my name.',
    metascore: 99,
    metascoreReviewsCount: 38,
    trendingRank: 5,
    boxOffice: {
      budget: '$3,000,000 per episode',
      worldwideGross: 'Syndication & Streaming Record',
      openingWeekend: 'N/A (Television)',
    },
    technicalSpecs: {
      aspectRatio: '16:9 HD (1.78 : 1)',
      soundMix: 'Dolby Digital 5.1',
      camera: 'Arriflex 416, 35mm film',
      laboratory: 'Deluxe, Hollywood',
    },
    trivia: [
      'The "blue sky" meth in the series was actually blue cotton candy rock sugar, which Bryan Cranston and Aaron Paul regularly ate on set between takes.',
      'Bryan Cranston threw the pizza onto the roof of the White residence in one single unbroken take, surprising the entire crew.',
      'Guinness World Records officially awarded Breaking Bad the highest-rated TV show in history with a 99% critical acclaim score.',
    ],
    ratings: {
      imdb: { score: 9.5, votes: 2200000 },
      tmdb: { score: 8.9, votes: 13900 },
      userCommunity: { score: 4.9, votes: 2400 },
      bayesianScore: calculateBayesianScore(2200000, 9.5),
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 8, name: 'Netflix', logoPath: 'https://image.tmdb.org/t/p/w92/9A1JSVmSxsya9w326pxv6m.png', displayPriority: 1 }, offerType: 'stream', streamUrl: 'https://www.netflix.com' }
        ],
        rent: [],
        buy: []
      }
    }
  },
  {
    id: 'interstellar-2014',
    tmdbId: 157336,
    imdbId: 'tt0816692',
    type: 'movie',
    title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    releaseDate: '2014-11-05',
    runtimeMinutes: 169,
    status: 'released',
    originalLanguage: 'en',
    posterPath: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    genres: [
      { id: 12, name: 'Adventure' },
      { id: 18, name: 'Drama' },
      { id: 878, name: 'Science Fiction' }
    ],
    cast: [
      { id: 10297, name: 'Matthew McConaughey', role: 'actor', character: 'Joseph Cooper' },
      { id: 1813, name: 'Anne Hathaway', role: 'actor', character: 'Dr. Amelia Brand' },
      { id: 83002, name: 'Jessica Chastain', role: 'actor', character: 'Murphy "Murph" Cooper' },
      { id: 3895, name: 'Michael Caine', role: 'actor', character: 'Professor John Brand' }
    ],
    directors: [{ id: 525, name: 'Christopher Nolan', role: 'director' }],
    trailerYoutubeKey: 'zSWdZVtXT7E',
    popularity: 94.6,
    certification: 'PG-13',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    metascore: 74,
    metascoreReviewsCount: 46,
    trendingRank: 6,
    boxOffice: {
      budget: '$165,000,000',
      worldwideGross: '$733,052,783',
      openingWeekend: '$47,510,360 (US)',
    },
    technicalSpecs: {
      aspectRatio: '1.43 : 1 (IMAX 70mm), 2.39 : 1 (Standard 35mm)',
      soundMix: 'Datasat, Dolby Digital, IMAX 6-Track',
      camera: 'IMAX MSM 9802, Panavision Panaflex Millennium XL2',
      laboratory: 'FotoKem Laboratory, Burbank, USA',
    },
    trivia: [
      'Astrophysicist and Nobel laureate Kip Thorne collaborated with visual effects house Double Negative; their gravitational equations for the Gargantua black hole produced groundbreaking scientific papers.',
      'The ticking sound in the soundtrack on Miller’s water planet happens every 1.25 seconds; in that time frame on Earth, an entire day has passed.',
      'Christopher Nolan planted 500 acres of real corn for the Cooper farm sequence, harvested it, and sold the corn at a net profit for the production.',
    ],
    ratings: {
      imdb: { score: 8.7, votes: 2100000 },
      tmdb: { score: 8.4, votes: 35000 },
      userCommunity: { score: 4.8, votes: 2600 },
      bayesianScore: calculateBayesianScore(2100000, 8.7),
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 220, name: 'JioCinema', logoPath: 'https://image.tmdb.org/t/p/w92/7rw3q.png', displayPriority: 1 }, offerType: 'stream' },
          { provider: { id: 119, name: 'Amazon Prime Video', logoPath: 'https://image.tmdb.org/t/p/w92/pvsGg12z0p5k1A01Lp.png', displayPriority: 2 }, offerType: 'stream' }
        ],
        rent: [{ provider: { id: 2, name: 'Apple TV', logoPath: 'https://image.tmdb.org/t/p/w92/peURlLlr8jggOwK53fJ5wdQl05y.png', displayPriority: 1 }, offerType: 'rent' }],
        buy: [{ provider: { id: 2, name: 'Apple TV', logoPath: 'https://image.tmdb.org/t/p/w92/peURlLlr8jggOwK53fJ5wdQl05y.png', displayPriority: 1 }, offerType: 'buy' }]
      }
    }
  },
  {
    id: '12th-fail-2023',
    tmdbId: 1163258,
    imdbId: 'tt23849204',
    type: 'movie',
    title: '12th Fail',
    overview: 'Based on the true story of IPS officer Manoj Kumar Sharma, 12th Fail tells the gritty story of an impoverished student from Chambal who restarted his academic journey to clear the prestigious UPSC Civil Services exam.',
    releaseDate: '2023-10-27',
    runtimeMinutes: 147,
    status: 'released',
    originalLanguage: 'hi',
    posterPath: 'https://image.tmdb.org/t/p/w500/eebUPRI4Z5e1Z7Hev4JZAwMIFkX.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/6RV2o8PBCEyw9ylOWViV1CtULIF.jpg',
    genres: [
      { id: 18, name: 'Drama' },
      { id: 36, name: 'History' }
    ],
    cast: [
      { id: 1208682, name: 'Vikrant Massey', role: 'actor', character: 'Manoj Kumar Sharma' },
      { id: 2841920, name: 'Medha Shankar', role: 'actor', character: 'Shraddha Joshi' },
      { id: 1419750, name: 'Anant V Joshi', role: 'actor', character: 'Pritam Pandey' },
    ],
    directors: [{ id: 45790, name: 'Vidhu Vinod Chopra', role: 'director' }],
    trailerYoutubeKey: 'KjbtuqENvVE',
    popularity: 87.6,
    certification: 'U',
    tagline: '#Restart',
    metascore: 85,
    metascoreReviewsCount: 18,
    trendingRank: 7,
    boxOffice: {
      budget: '₹20 Crore (~$2.4M)',
      worldwideGross: '₹67 Crore (~$8.1M)',
      openingWeekend: '₹3.4 Crore',
    },
    technicalSpecs: {
      aspectRatio: '2.39 : 1',
      soundMix: 'Dolby Atmos',
      camera: 'Sony Venice 2',
      laboratory: 'Prime Focus, Mumbai',
    },
    trivia: [
      'The real IPS Manoj Kumar Sharma and IRS officer Shraddha Joshi made a subtle cameo in the background of the final selection hall scene.',
      'Vikrant Massey spent months in Mukherjee Nagar, Delhi, observing real UPSC aspirants and losing 8 kilograms to look genuine.',
      'Director Vidhu Vinod Chopra funded much of the distribution independently after traditional studios doubted a non-action drama would succeed in cinemas.',
    ],
    ratings: {
      imdb: { score: 8.9, votes: 130000 },
      tmdb: { score: 8.1, votes: 290 },
      userCommunity: { score: 4.8, votes: 1120 },
      bayesianScore: calculateBayesianScore(130000, 8.9),
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 122, name: 'Disney+ Hotstar', logoPath: 'https://image.tmdb.org/t/p/w92/7rw.png', displayPriority: 1 }, offerType: 'stream', streamUrl: 'https://www.hotstar.com' }
        ],
        rent: [],
        buy: []
      }
    }
  },
  {
    id: 'mirzapur-s3-2024',
    tmdbId: 84105,
    imdbId: 'tt6473300',
    type: 'web_series',
    title: 'Mirzapur',
    overview: 'A shocking incident at a wedding procession ignites a series of events entangling two families in the lawless city of Mirzapur, ruled by the mafia boss Akhandanand Tripathi.',
    releaseDate: '2018-11-16',
    seasonsCount: 3,
    episodesCount: 29,
    status: 'released',
    originalLanguage: 'hi',
    posterPath: 'https://image.tmdb.org/t/p/w500/p0qM8hhlMF5DuxHBzl2EZR6TehX.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/3dV7pWAdwIPKR2lMIACMfObXdgK.jpg',
    genres: [
      { id: 80, name: 'Crime' },
      { id: 18, name: 'Drama' },
      { id: 28, name: 'Action' }
    ],
    cast: [
      { id: 1179460, name: 'Pankaj Tripathi', role: 'actor', character: 'Akhandanand "Kaleen Bhaiya" Tripathi' },
      { id: 1276535, name: 'Ali Fazal', role: 'actor', character: 'Guddu Pandit' },
      { id: 1416954, name: 'Shweta Tripathi', role: 'actor', character: 'Golu Gupta' },
      { id: 1421033, name: 'Divyenndu', role: 'actor', character: 'Munna Tripathi' },
    ],
    directors: [{ id: 1845112, name: 'Karan Anshuman', role: 'creator' }, { id: 1845113, name: 'Gurmmeet Singh', role: 'director' }],
    trailerYoutubeKey: 'ZNeGF-PvRHY',
    popularity: 94.2,
    certification: 'A (18+)',
    tagline: 'Gaddi pe chahe hum rahein ya Munna, niyam same hoga.',
    metascore: 81,
    metascoreReviewsCount: 14,
    trendingRank: 8,
    boxOffice: {
      budget: '₹60 Crore per season',
      worldwideGross: 'Streamed in 180+ countries',
      openingWeekend: 'Highest Day 1 viewership for Amazon Prime India',
    },
    technicalSpecs: {
      aspectRatio: '2.00 : 1 Univisium',
      soundMix: 'Dolby 5.1',
      camera: 'Red Epic Dragon 6K',
      laboratory: 'Red Chillies VFX & Color',
    },
    trivia: [
      'Pankaj Tripathi improvised Kaleen Bhaiya’s famous neck twitch and calm demeanor to contrast with typical hot-tempered cinematic crime bosses.',
      'Ali Fazal gained 14kg of pure muscle mass and trained in freestyle wrestling for Guddu Pandit’s brutal transformation.',
    ],
    ratings: {
      imdb: { score: 8.5, votes: 87000 },
      tmdb: { score: 7.8, votes: 199 },
      userCommunity: { score: 4.6, votes: 890 },
      bayesianScore: calculateBayesianScore(87000, 8.5),
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 119, name: 'Amazon Prime Video', logoPath: 'https://image.tmdb.org/t/p/w92/pvsGg12z0p5k1A01Lp.png', displayPriority: 1 }, offerType: 'stream', streamUrl: 'https://www.primevideo.com' }
        ],
        rent: [],
        buy: []
      }
    }
  },
  {
    id: 'rrr-2022',
    tmdbId: 579974,
    imdbId: 'tt8178634',
    type: 'movie',
    title: 'RRR',
    overview: 'A fictional history of two legendary revolutionaries’ journey away from home before they began fighting for their country in the 1920s.',
    releaseDate: '2022-03-24',
    runtimeMinutes: 187,
    status: 'released',
    originalLanguage: 'te',
    posterPath: 'https://image.tmdb.org/t/p/w500/wE0I6efAW4cDDmZQWtwZMOW44EJ.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/i0Y0wP8H6SRgjr6QmuwbtQbS24D.jpg',
    genres: [
      { id: 28, name: 'Action' },
      { id: 18, name: 'Drama' },
      { id: 36, name: 'History' }
    ],
    cast: [
      { id: 1251025, name: 'N. T. Rama Rao Jr.', role: 'actor', character: 'Komaram Bheem' },
      { id: 1251026, name: 'Ram Charan', role: 'actor', character: 'Alluri Sitarama Raju' },
      { id: 111818, name: 'Alia Bhatt', role: 'actor', character: 'Sita' },
      { id: 6384, name: 'Ajay Devgn', role: 'actor', character: 'Venkata Rama Raju' }
    ],
    directors: [{ id: 62057, name: 'S. S. Rajamouli', role: 'director' }],
    trailerYoutubeKey: 'f_vbAtFSEc0',
    popularity: 90.1,
    certification: 'U/A 16+',
    tagline: 'Rise, Roar, Revolt.',
    metascore: 83,
    metascoreReviewsCount: 15,
    trendingRank: 9,
    boxOffice: {
      budget: '₹550 Crore (~$72M)',
      worldwideGross: '₹1,387 Crore (~$166M)',
      openingWeekend: '₹223 Crore ($29M Day 1)',
    },
    technicalSpecs: {
      aspectRatio: '1.90 : 1 (IMAX), 2.39 : 1 (Theatrical)',
      soundMix: 'Dolby Atmos, Auro 11.1',
      camera: 'Arri Alexa LF, Arri Alexa Mini LF',
      laboratory: 'Annapurna Studios, Hyderabad',
    },
    trivia: [
      'The iconic "Naatu Naatu" dance sequence was filmed directly in front of the Presidential Palace of Ukraine in Kyiv just months before the war began.',
      'RRR won the Academy Award for Best Original Song ("Naatu Naatu"), making it the first song from an Indian film production to win an Oscar.',
    ],
    ratings: {
      imdb: { score: 7.8, votes: 175000 },
      tmdb: { score: 7.7, votes: 1739 },
      userCommunity: { score: 4.7, votes: 1400 },
      bayesianScore: calculateBayesianScore(175000, 7.8),
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 8, name: 'Netflix', logoPath: 'https://image.tmdb.org/t/p/w92/9A1JSVmSxsya9w326pxv6m.png', displayPriority: 1 }, offerType: 'stream', streamUrl: 'https://www.netflix.com' },
          { provider: { id: 232, name: 'Zee5', logoPath: 'https://image.tmdb.org/t/p/w92/zee5.png', displayPriority: 2 }, offerType: 'stream' }
        ],
        rent: [],
        buy: []
      }
    }
  },
  {
    id: 'avengers-secret-wars-2027',
    tmdbId: 1003596,
    imdbId: 'tt21361450',
    type: 'movie',
    title: 'Avengers: Secret Wars',
    overview: 'An epic conclusion to the Multiverse Saga where alternate timelines, realities, and worlds collide as Earth’s Mightiest Heroes face the ultimate multiversal collapse.',
    releaseDate: '2027-05-07',
    runtimeMinutes: 195,
    status: 'upcoming',
    originalLanguage: 'en',
    posterPath: 'https://image.tmdb.org/t/p/w500/tTMmREfhVd51CCg7GN73wL8cIoT.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/rObL4of4eFA8yWaN9pRFo9aOVNi.jpg',
    genres: [
      { id: 28, name: 'Action' },
      { id: 878, name: 'Science Fiction' },
      { id: 12, name: 'Adventure' }
    ],
    cast: [
      { id: 3223, name: 'Robert Downey Jr.', role: 'actor', character: 'Doctor Doom / Victor von Doom' },
      { id: 74568, name: 'Chris Hemsworth', role: 'actor', character: 'Thor Odinson' },
      { id: 1136406, name: 'Tom Holland', role: 'actor', character: 'Peter Parker / Spider-Man' },
      { id: 71580, name: 'Benedict Cumberbatch', role: 'actor', character: 'Dr. Stephen Strange' },
    ],
    directors: [{ id: 19271, name: 'Anthony Russo', role: 'director' }, { id: 19272, name: 'Joe Russo', role: 'director' }],
    trailerYoutubeKey: 'T6-rwvb5udk',
    popularity: 99.9,
    tagline: 'The Multiverse bleeds into one final battle.',
    trendingRank: 10,
    technicalSpecs: {
      aspectRatio: '1.90 : 1 (IMAX Digital)',
      soundMix: 'Dolby Atmos, IMAX 12-Track',
      camera: 'Arri Alexa 65',
    },
    trivia: [
      'Robert Downey Jr. returns to the Marvel Cinematic Universe in the historic villainous role of Doctor Doom / Victor von Doom.',
      'The Russo Brothers return to helm both Avengers: Doomsday and Avengers: Secret Wars.',
    ],
    ratings: {
      userCommunity: { score: 4.9, votes: 980 },
      bayesianScore: 8.5,
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 122, name: 'Disney+ Hotstar', logoPath: 'https://image.tmdb.org/t/p/w92/7rw.png', displayPriority: 1 }, offerType: 'stream' }
        ],
        rent: [],
        buy: []
      }
    }
  },
  {
    id: 'kalki-2898-ad-2024',
    tmdbId: 801688,
    imdbId: 'tt12735488',
    type: 'movie',
    title: 'Kalki 2898 AD',
    overview: 'Set in a post-apocalyptic city of Kasi in the year 2898 AD, the world is ruled by Supreme Yaskin from the Complex. When SUM-80 escapes carrying a miraculous child prophesied to end the darkness, immortal warrior Ashwatthama rises to defend her while bounty hunter Bhairava pursues the ultimate bounty.',
    releaseDate: '2024-06-27',
    runtimeMinutes: 181,
    status: 'released',
    originalLanguage: 'te',
    posterPath: 'https://image.tmdb.org/t/p/w500/rstcAnBeCkxNQjNp3YXrF6IP1tW.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/whNjsTOUVg2lZLCKgGhnACnmV8E.jpg',
    genres: [
      { id: 28, name: 'Action' },
      { id: 878, name: 'Science Fiction' },
      { id: 14, name: 'Fantasy' }
    ],
    cast: [
      { id: 78531, name: 'Prabhas', role: 'actor', character: 'Bhairava / Karna' },
      { id: 11090, name: 'Amitabh Bachchan', role: 'actor', character: 'Ashwatthama' },
      { id: 11364, name: 'Kamal Haasan', role: 'actor', character: 'Supreme Yaskin' },
      { id: 8699, name: 'Deepika Padukone', role: 'actor', character: 'SUM-80' }
    ],
    directors: [{ id: 1354020, name: 'Nag Ashwin', role: 'director' }],
    trailerYoutubeKey: 'kQDd1AhGIHk',
    popularity: 96.5,
    tagline: 'The future of Indian cinema begins.',
    trivia: [
      'Nag Ashwin spent four years developing the custom sci-fi world, fusing Hindu mythology from the Mahabharata with futuristic cyberpunk technology.',
      'Amitabh Bachchan performed extensive physical action sequences without a body double as the legendary Ashwatthama.',
    ],
    ratings: {
      imdb: { score: 7.6, votes: 78000 },
      tmdb: { score: 7.4, votes: 190 },
      userCommunity: { score: 4.6, votes: 540 },
      bayesianScore: calculateBayesianScore(78000, 7.6),
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 8, name: 'Netflix', logoPath: 'https://image.tmdb.org/t/p/w92/9A1JSVmSxsya9w326pxv6m.png', displayPriority: 1 }, offerType: 'stream', streamUrl: 'https://www.netflix.com' },
          { provider: { id: 119, name: 'Amazon Prime Video', logoPath: 'https://image.tmdb.org/t/p/w92/pvsGg12z0p5k1A01Lp.png', displayPriority: 2 }, offerType: 'stream', streamUrl: 'https://www.primevideo.com' }
        ],
        rent: [],
        buy: []
      }
    }
  },
  {
    id: 'the-batman-part-ii-2026',
    tmdbId: 806704,
    imdbId: 'tt20869502',
    type: 'movie',
    title: 'The Batman: Part II',
    overview: 'Bruce Wayne delves deeper into the corruption of Gotham City as a terrifying new criminal mastermind tests his resolve as the city’s nocturnal guardian.',
    releaseDate: '2026-10-02',
    runtimeMinutes: 170,
    status: 'upcoming',
    originalLanguage: 'en',
    posterPath: 'https://image.tmdb.org/t/p/w500/r5fl4aMsmTjgc8DdDqQaM84roWp.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/4uaHnYDDpUTj0nCg6YqBKab50YW.jpg',
    genres: [
      { id: 28, name: 'Action' },
      { id: 80, name: 'Crime' },
      { id: 18, name: 'Drama' }
    ],
    cast: [
      { id: 11288, name: 'Robert Pattinson', role: 'actor', character: 'Bruce Wayne / The Batman' },
      { id: 1345, name: 'Andy Serkis', role: 'actor', character: 'Alfred Pennyworth' },
      { id: 1243, name: 'Colin Farrell', role: 'actor', character: 'Oswald Cobblepot / The Penguin' }
    ],
    directors: [{ id: 15218, name: 'Matt Reeves', role: 'director' }],
    trailerYoutubeKey: 'mqqft2x_Aa4',
    popularity: 93.8,
    tagline: 'Vengeance returns to the shadows.',
    trivia: [
      'Matt Reeves confirmed the storyline directly continues following the explosive flood of Gotham City and the rise of The Penguin syndicate.',
    ],
    ratings: {
      userCommunity: { score: 4.8, votes: 410 },
      bayesianScore: 8.4,
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 220, name: 'JioCinema', logoPath: 'https://image.tmdb.org/t/p/w92/7rw3q.png', displayPriority: 1 }, offerType: 'stream' }
        ],
        rent: [],
        buy: []
      }
    }
  },
  {
    id: 'the-dark-knight-2008',
    tmdbId: 155,
    imdbId: 'tt0468569',
    type: 'movie',
    title: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and DA Harvey Dent, but finds himself in a psychological test against the sadistic anarchist mastermind known as The Joker.',
    releaseDate: '2008-07-18',
    runtimeMinutes: 152,
    status: 'released',
    originalLanguage: 'en',
    posterPath: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    genres: [
      { id: 28, name: 'Action' },
      { id: 80, name: 'Crime' },
      { id: 18, name: 'Drama' },
    ],
    cast: [
      { id: 3894, name: 'Christian Bale', role: 'actor', character: 'Bruce Wayne / Batman', profilePath: 'https://image.tmdb.org/t/p/w185/b7fTC9WFkgq6oNNeb1RXcJmpbg0.jpg' },
      { id: 1810, name: 'Heath Ledger', role: 'actor', character: 'Joker', profilePath: 'https://image.tmdb.org/t/p/w185/5Y9HnYYa9jF4NuY9lX9cq589.jpg' },
      { id: 64, name: 'Gary Oldman', role: 'actor', character: 'Jim Gordon', profilePath: 'https://image.tmdb.org/t/p/w185/2v9FsB9O4qJ5p019sDk.jpg' },
      { id: 3895, name: 'Michael Caine', role: 'actor', character: 'Alfred Pennyworth', profilePath: 'https://image.tmdb.org/t/p/w185/hZ4h16m.jpg' },
    ],
    directors: [{ id: 525, name: 'Christopher Nolan', role: 'director' }],
    trailerYoutubeKey: 'EXeTwQWrcwY',
    popularity: 98.7,
    certification: 'PG-13',
    tagline: 'Why So Serious?',
    metascore: 84,
    metascoreReviewsCount: 39,
    trendingRank: 3,
    boxOffice: {
      budget: '$185,000,000',
      worldwideGross: '$1,006,234,167',
      openingWeekend: '$158,411,483 (US)',
    },
    technicalSpecs: {
      aspectRatio: '2.39 : 1 (IMAX sequences 1.43 : 1)',
      soundMix: 'Dolby Digital, DTS, SDDS, IMAX 6-Track',
      camera: 'IMAX MSM 9802, Panavision Panaflex Millennium XL',
    },
    trivia: [
      'Heath Ledger posthumously won the Academy Award for Best Supporting Actor for his electrifying portrayal of the Joker.',
      'This was the first major feature film partially shot with high-resolution 15/70mm IMAX cameras.',
    ],
    ratings: {
      imdb: { score: 9.0, votes: 2950000 },
      tmdb: { score: 8.5, votes: 32000 },
      userCommunity: { score: 4.9, votes: 1200 },
      bayesianScore: calculateBayesianScore(2950000, 9.0),
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 220, name: 'JioCinema', logoPath: 'https://image.tmdb.org/t/p/w92/7rw3q.png', displayPriority: 1 }, offerType: 'stream', streamUrl: 'https://www.jiocinema.com' },
          { provider: { id: 119, name: 'Amazon Prime Video', logoPath: 'https://image.tmdb.org/t/p/w92/pvsGg12z0p5k1A01Lp.png', displayPriority: 2 }, offerType: 'stream' },
        ],
        rent: [{ provider: { id: 2, name: 'Apple TV', logoPath: '', displayPriority: 1 }, offerType: 'rent' }],
        buy: [{ provider: { id: 2, name: 'Apple TV', logoPath: '', displayPriority: 1 }, offerType: 'buy' }],
      },
      US: {
        countryCode: 'US',
        countryName: 'United States',
        stream: [{ provider: { id: 1899, name: 'Max', logoPath: '', displayPriority: 1 }, offerType: 'stream' }],
        rent: [],
        buy: [],
      },
    },
  },
  {
    id: 'pulp-fiction-1994',
    tmdbId: 680,
    imdbId: 'tt0110912',
    type: 'movie',
    title: 'Pulp Fiction',
    overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    releaseDate: '1994-10-14',
    runtimeMinutes: 154,
    status: 'released',
    originalLanguage: 'en',
    posterPath: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
    genres: [
      { id: 53, name: 'Thriller' },
      { id: 80, name: 'Crime' },
    ],
    cast: [
      { id: 8891, name: 'John Travolta', role: 'actor', character: 'Vincent Vega' },
      { id: 2231, name: 'Samuel L. Jackson', role: 'actor', character: 'Jules Winnfield' },
      { id: 139, name: 'Uma Thurman', role: 'actor', character: 'Mia Wallace' },
      { id: 62, name: 'Bruce Willis', role: 'actor', character: 'Butch Coolidge' },
    ],
    directors: [{ id: 138, name: 'Quentin Tarantino', role: 'director' }],
    trailerYoutubeKey: 's7EdQ4FqbhY',
    popularity: 91.2,
    certification: 'R',
    tagline: 'Just because you are a character does not mean you have character.',
    metascore: 95,
    metascoreReviewsCount: 26,
    boxOffice: {
      budget: '$8,500,000',
      worldwideGross: '$213,928,762',
    },
    technicalSpecs: {
      aspectRatio: '2.39 : 1',
      soundMix: 'Dolby Digital, 70 mm 6-Track',
      camera: 'Arriflex 35 III, Panavision Panaflex Gold II',
    },
    trivia: [
      'Pulp Fiction won the prestigious Palme d’Or at the 1994 Cannes Film Festival and won the Academy Award for Best Original Screenplay.',
      'The iconic dance sequence at Jack Rabbit Slim’s was an homage to Jean-Luc Godard’s Band of Outsiders (1964).',
    ],
    ratings: {
      imdb: { score: 8.9, votes: 2280000 },
      tmdb: { score: 8.5, votes: 27500 },
      userCommunity: { score: 4.8, votes: 940 },
      bayesianScore: calculateBayesianScore(2280000, 8.9),
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 119, name: 'Amazon Prime Video', logoPath: 'https://image.tmdb.org/t/p/w92/pvsGg12z0p5k1A01Lp.png', displayPriority: 1 }, offerType: 'stream' },
        ],
        rent: [],
        buy: [],
      },
    },
  },
  {
    id: 'spirited-away-2001',
    tmdbId: 129,
    imdbId: 'tt0245429',
    type: 'movie',
    title: 'Spirited Away',
    originalTitle: '千と千尋の神隠し',
    overview: 'A ten-year-old girl named Chihiro wanders into an enchanted bathhouse world for spirits ruled by the sorceress Yubaba, and must summon courage to rescue her parents.',
    releaseDate: '2001-07-20',
    runtimeMinutes: 125,
    status: 'released',
    originalLanguage: 'ja',
    posterPath: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg',
    genres: [
      { id: 16, name: 'Animation' },
      { id: 10751, name: 'Family' },
      { id: 14, name: 'Fantasy' },
    ],
    cast: [
      { id: 19588, name: 'Rumi Hiiragi', role: 'actor', character: 'Chihiro Ogino / Sen (voice)' },
      { id: 19589, name: 'Miyu Irino', role: 'actor', character: 'Haku (voice)' },
      { id: 19590, name: 'Mari Natsuki', role: 'actor', character: 'Yubaba / Zeniba (voice)' },
    ],
    directors: [{ id: 608, name: 'Hayao Miyazaki', role: 'director' }],
    trailerYoutubeKey: 'ByXuk9QqQkk',
    popularity: 88.9,
    certification: 'PG',
    tagline: 'The tunnel led Chihiro to a mysterious town...',
    metascore: 96,
    metascoreReviewsCount: 41,
    boxOffice: {
      budget: '$19,000,000',
      worldwideGross: '$395,580,000',
    },
    technicalSpecs: {
      aspectRatio: '1.85 : 1',
      soundMix: 'Dolby Digital Surround EX, DTS-ES',
    },
    trivia: [
      'Hayao Miyazaki created the film without a script; the story developed organically as storyboard illustrations were produced.',
      'Won the Academy Award for Best Animated Feature at the 75th Oscars, remaining the only hand-drawn, non-English language animation to do so.',
    ],
    ratings: {
      imdb: { score: 8.6, votes: 850000 },
      tmdb: { score: 8.5, votes: 16000 },
      userCommunity: { score: 4.8, votes: 650 },
      bayesianScore: calculateBayesianScore(850000, 8.6),
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 8, name: 'Netflix', logoPath: 'https://image.tmdb.org/t/p/w92/9A1JSVmSxsya9w326pxv6m.png', displayPriority: 1 }, offerType: 'stream', streamUrl: 'https://www.netflix.com' },
        ],
        rent: [],
        buy: [],
      },
    },
  },
  {
    id: 'parasite-2019',
    tmdbId: 496243,
    imdbId: 'tt6751668',
    type: 'movie',
    title: 'Parasite',
    originalTitle: '기생충',
    overview: 'All unemployed, Ki-taek and his family take peculiar interest in the wealthy and glamorous Parks, as they ingratiate themselves into their lives and get entangled in an unexpected incident.',
    releaseDate: '2019-05-30',
    runtimeMinutes: 132,
    status: 'released',
    originalLanguage: 'ko',
    posterPath: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg',
    genres: [
      { id: 35, name: 'Comedy' },
      { id: 53, name: 'Thriller' },
      { id: 18, name: 'Drama' },
    ],
    cast: [
      { id: 20738, name: 'Song Kang-ho', role: 'actor', character: 'Kim Ki-taek' },
      { id: 216866, name: 'Lee Sun-kyun', role: 'actor', character: 'Park Dong-ik' },
      { id: 1025705, name: 'Cho Yeo-jeong', role: 'actor', character: 'Choi Yeon-gyo' },
      { id: 1253360, name: 'Choi Woo-shik', role: 'actor', character: 'Kim Ki-woo' },
    ],
    directors: [{ id: 21684, name: 'Bong Joon-ho', role: 'director' }],
    trailerYoutubeKey: 'isOGD_7hNIY',
    popularity: 89.4,
    certification: 'R',
    tagline: 'Act like you own the place.',
    metascore: 96,
    metascoreReviewsCount: 52,
    boxOffice: {
      budget: '$11,400,000',
      worldwideGross: '$263,136,742',
    },
    technicalSpecs: {
      aspectRatio: '2.39 : 1',
      soundMix: 'Dolby Atmos',
      camera: 'Arri Alexa 65',
    },
    trivia: [
      'Made history at the 92nd Academy Awards by becoming the first non-English-language film in Oscar history to win Best Picture.',
      'Also won the Palme d’Or at Cannes by a unanimous vote from the jury led by Alejandro González Iñárritu.',
    ],
    ratings: {
      imdb: { score: 8.5, votes: 940000 },
      tmdb: { score: 8.5, votes: 17800 },
      userCommunity: { score: 4.8, votes: 710 },
      bayesianScore: calculateBayesianScore(940000, 8.5),
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 122, name: 'Sony LIV', logoPath: '', displayPriority: 1 }, offerType: 'stream' },
        ],
        rent: [{ provider: { id: 2, name: 'Apple TV', logoPath: '', displayPriority: 1 }, offerType: 'rent' }],
        buy: [],
      },
    },
  },
  {
    id: 'seven-samurai-1954',
    tmdbId: 346,
    imdbId: 'tt0047478',
    type: 'movie',
    title: 'Seven Samurai',
    originalTitle: '七人の侍',
    overview: 'A poor village under attack by bandits recruits seven unemployed samurai to help them defend themselves in 16th century Sengoku period Japan.',
    releaseDate: '1954-04-26',
    runtimeMinutes: 207,
    status: 'released',
    originalLanguage: 'ja',
    posterPath: 'https://image.tmdb.org/t/p/w500/lOMGc8bnSwQhS4XyE1S99uH8NXf.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/qvZ91FwMq6O47VViAr8vZNQz3WI.jpg',
    genres: [
      { id: 28, name: 'Action' },
      { id: 18, name: 'Drama' },
    ],
    cast: [
      { id: 649, name: 'Toshiro Mifune', role: 'actor', character: 'Kikuchiyo' },
      { id: 650, name: 'Takashi Shimura', role: 'actor', character: 'Kambei Shimada' },
    ],
    directors: [{ id: 5026, name: 'Akira Kurosawa', role: 'director' }],
    trailerYoutubeKey: '1XMJY0hYJEw',
    popularity: 82.5,
    certification: 'Not Rated',
    tagline: 'The magnificent seven of cinematic history.',
    metascore: 98,
    metascoreReviewsCount: 30,
    boxOffice: {
      budget: '$500,000',
      worldwideGross: '$3,800,000',
    },
    technicalSpecs: {
      aspectRatio: '1.37 : 1',
      soundMix: 'Mono',
    },
    trivia: [
      'Pioneered modern action filmmaking techniques: multiple simultaneous camera setups, slow-motion battle choreography, and assembling a team of distinct archetypes.',
      'Inspired The Magnificent Seven, Star Wars, A Bug’s Life, and countless ensemble action narratives.',
    ],
    ratings: {
      imdb: { score: 8.6, votes: 375000 },
      tmdb: { score: 8.5, votes: 3600 },
      userCommunity: { score: 4.8, votes: 290 },
      bayesianScore: calculateBayesianScore(375000, 8.6),
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 119, name: 'Amazon Prime Video', logoPath: '', displayPriority: 1 }, offerType: 'stream' },
        ],
        rent: [],
        buy: [],
      },
    },
  },
  {
    id: 'city-of-god-2002',
    tmdbId: 598,
    imdbId: 'tt0317248',
    type: 'movie',
    title: 'City of God',
    originalTitle: 'Cidade de Deus',
    overview: 'In the poverty-stricken slums of Rio de Janeiro in the 1970s, two young men follow different paths: one strives to become a photographer, while the other becomes a ruthless drug lord.',
    releaseDate: '2002-08-30',
    runtimeMinutes: 130,
    status: 'released',
    originalLanguage: 'pt',
    posterPath: 'https://image.tmdb.org/t/p/w500/k7eYdWvhYQyRQoU2TB2A2Xu2TfD.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/iNh3BivHyg5sQRPP1KOkzguEX0H.jpg',
    genres: [
      { id: 18, name: 'Drama' },
      { id: 80, name: 'Crime' },
    ],
    cast: [
      { id: 10127, name: 'Alexandre Rodrigues', role: 'actor', character: 'Buscapé (Rocket)' },
      { id: 10128, name: 'Leandro Firmino', role: 'actor', character: 'Zé Pequeno (Li\'l Zé)' },
    ],
    directors: [
      { id: 10125, name: 'Fernando Meirelles', role: 'director' },
      { id: 10126, name: 'Kátia Lund', role: 'director' },
    ],
    trailerYoutubeKey: 'dcUOO4Itgmw',
    popularity: 84.1,
    certification: 'R',
    tagline: 'If you run, the beast catches you; if you stay, the beast eats you.',
    metascore: 79,
    metascoreReviewsCount: 33,
    boxOffice: {
      budget: '$3,300,000',
      worldwideGross: '$30,649,850',
    },
    technicalSpecs: {
      aspectRatio: '1.85 : 1',
      soundMix: 'Dolby Digital',
    },
    trivia: [
      'Over 200 non-professional actors residing in Rio de Janeiro favelas were cast and trained in a months-long workshop.',
      'Nominated for four Academy Awards, including Best Director and Best Adapted Screenplay.',
    ],
    ratings: {
      imdb: { score: 8.6, votes: 820000 },
      tmdb: { score: 8.4, votes: 7300 },
      userCommunity: { score: 4.7, votes: 520 },
      bayesianScore: calculateBayesianScore(820000, 8.6),
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 119, name: 'Amazon Prime Video', logoPath: '', displayPriority: 1 }, offerType: 'stream' },
        ],
        rent: [],
        buy: [],
      },
    },
  },
  {
    id: 'baahubali-2-2017',
    tmdbId: 359940,
    imdbId: 'tt4849438',
    type: 'movie',
    title: 'Baahubali 2: The Conclusion',
    overview: 'When Shiva, the son of Bahubali, learns about his heritage, he begins to look for answers. His story is juxtaposed with past events that unfolded in the Mahishmati Kingdom.',
    releaseDate: '2017-04-28',
    runtimeMinutes: 167,
    status: 'released',
    originalLanguage: 'te',
    posterPath: 'https://image.tmdb.org/t/p/w500/21sC2assImQIYCEDA84Qh9d1RsK.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/whNjsTOUVg2lZLCKgGhnACnmV8E.jpg',
    genres: [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 14, name: 'Fantasy' },
    ],
    cast: [
      { id: 74213, name: 'Prabhas', role: 'actor', character: 'Amarendra Baahubali / Mahendra Baahubali' },
      { id: 110904, name: 'Rana Daggubati', role: 'actor', character: 'Bhallaladeva' },
      { id: 119428, name: 'Anushka Shetty', role: 'actor', character: 'Devasena' },
      { id: 123894, name: 'Sathyaraj', role: 'actor', character: 'Kattappa' },
    ],
    directors: [{ id: 74212, name: 'S.S. Rajamouli', role: 'director' }],
    trailerYoutubeKey: 'qD-6d8Wo3do',
    popularity: 87.3,
    certification: 'U/A',
    tagline: 'The boy becomes a man, the king becomes a legend.',
    metascore: 82,
    metascoreReviewsCount: 18,
    boxOffice: {
      budget: '₹2,500,000,000 (~$37M)',
      worldwideGross: '₹18,100,000,000 (~$270M)',
    },
    technicalSpecs: {
      aspectRatio: '2.39 : 1',
      soundMix: 'Dolby Atmos, Auro 11.1',
    },
    trivia: [
      'Became the highest-grossing film in India of all time and introduced Indian pan-country cinema to a global audience.',
      'The viral suspense "Why Kattappa killed Baahubali?" became a worldwide cultural phenomenon for two full years.',
    ],
    ratings: {
      imdb: { score: 8.2, votes: 120000 },
      tmdb: { score: 7.7, votes: 1100 },
      userCommunity: { score: 4.6, votes: 550 },
      bayesianScore: calculateBayesianScore(120000, 8.2),
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 8, name: 'Netflix', logoPath: 'https://image.tmdb.org/t/p/w92/9A1JSVmSxsya9w326pxv6m.png', displayPriority: 1 }, offerType: 'stream', streamUrl: 'https://www.netflix.com' },
          { provider: { id: 122, name: 'Sony LIV', logoPath: '', displayPriority: 2 }, offerType: 'stream' },
        ],
        rent: [],
        buy: [],
      },
    },
  },
  {
    id: 'sacred-games-series',
    tmdbId: 80562,
    imdbId: 'tt6077448',
    type: 'web_series',
    title: 'Sacred Games',
    overview: 'A link in their pasts leads an honest police officer Sartaj Singh to an enigmatic criminal mastermind Ganesh Gaitonde, who warns that Mumbai will be destroyed in 25 days.',
    releaseDate: '2018-07-06',
    seasonsCount: 2,
    episodesCount: 16,
    status: 'released',
    originalLanguage: 'hi',
    posterPath: 'https://image.tmdb.org/t/p/w500/dD3HcMczLC9wNvfNzx4pZVyl6q8.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/5YEnPWmTMpPtFk3MxjlfO1U1xW5.jpg',
    genres: [
      { id: 80, name: 'Crime' },
      { id: 18, name: 'Drama' },
      { id: 9648, name: 'Mystery' },
    ],
    cast: [
      { id: 131975, name: 'Saif Ali Khan', role: 'actor', character: 'Inspector Sartaj Singh' },
      { id: 74214, name: 'Nawazuddin Siddiqui', role: 'actor', character: 'Ganesh Gaitonde' },
      { id: 5082, name: 'Radhika Apte', role: 'actor', character: 'Anjali Mathur' },
      { id: 131975, name: 'Pankaj Tripathi', role: 'actor', character: 'Guruji' },
    ],
    directors: [
      { id: 35150, name: 'Anurag Kashyap', role: 'director' },
      { id: 35151, name: 'Vikramaditya Motwane', role: 'director' },
    ],
    trailerYoutubeKey: 'AkUgf2jIPyI',
    popularity: 88.0,
    certification: '18+',
    tagline: 'Kabhi kabhi lagta hai apun hi bhagwan hai.',
    metascore: 85,
    trivia: [
      'Netflix’s very first Indian original web series, opening the golden era for Indian prestige episodic television worldwide.',
      'Nominated for the 47th International Emmy Awards for Best Drama Series.',
    ],
    ratings: {
      imdb: { score: 8.5, votes: 94000 },
      tmdb: { score: 7.9, votes: 650 },
      userCommunity: { score: 4.7, votes: 410 },
      bayesianScore: calculateBayesianScore(94000, 8.5),
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 8, name: 'Netflix', logoPath: 'https://image.tmdb.org/t/p/w92/9A1JSVmSxsya9w326pxv6m.png', displayPriority: 1 }, offerType: 'stream', streamUrl: 'https://www.netflix.com' },
        ],
        rent: [],
        buy: [],
      },
    },
  },
  {
    id: 'stranger-things-series',
    tmdbId: 66732,
    imdbId: 'tt4574334',
    type: 'tv',
    title: 'Stranger Things',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    releaseDate: '2016-07-15',
    seasonsCount: 4,
    episodesCount: 34,
    status: 'released',
    originalLanguage: 'en',
    posterPath: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    genres: [
      { id: 18, name: 'Drama' },
      { id: 14, name: 'Fantasy' },
      { id: 9648, name: 'Mystery' },
      { id: 878, name: 'Science Fiction' },
    ],
    cast: [
      { id: 135651, name: 'Millie Bobby Brown', role: 'actor', character: 'Eleven' },
      { id: 2157, name: 'Winona Ryder', role: 'actor', character: 'Joyce Byers' },
      { id: 3450, name: 'David Harbour', role: 'actor', character: 'Jim Hopper' },
      { id: 1544073, name: 'Finn Wolfhard', role: 'actor', character: 'Mike Wheeler' },
    ],
    directors: [{ id: 1179422, name: 'The Duffer Brothers', role: 'director' }],
    trailerYoutubeKey: 'b9EkMc79ZSU',
    popularity: 96.5,
    certification: 'TV-14',
    tagline: 'Every ending has a beginning.',
    metascore: 76,
    trivia: [
      'The Duffer Brothers initially pitched the show to more than fifteen different cable networks, all of whom rejected it before Netflix bought it in 24 hours.',
      'The series holds the record for one of Netflix’s most-watched English language television seasons ever with over 1.35 billion hours viewed for Season 4.',
    ],
    ratings: {
      imdb: { score: 8.7, votes: 1400000 },
      tmdb: { score: 8.6, votes: 18200 },
      userCommunity: { score: 4.8, votes: 830 },
      bayesianScore: calculateBayesianScore(1400000, 8.7),
    },
    availability: {
      IN: {
        countryCode: 'IN',
        countryName: 'India',
        stream: [
          { provider: { id: 8, name: 'Netflix', logoPath: 'https://image.tmdb.org/t/p/w92/9A1JSVmSxsya9w326pxv6m.png', displayPriority: 1 }, offerType: 'stream', streamUrl: 'https://www.netflix.com' },
        ],
        rent: [],
        buy: [],
      },
      US: {
        countryCode: 'US',
        countryName: 'United States',
        stream: [
          { provider: { id: 8, name: 'Netflix', logoPath: 'https://image.tmdb.org/t/p/w92/9A1JSVmSxsya9w326pxv6m.png', displayPriority: 1 }, offerType: 'stream' },
        ],
        rent: [],
        buy: [],
      },
    },
  }
];

export const CELEBRITIES_BORN_TODAY: Celebrity[] = [
  {
    id: 525,
    name: 'Christopher Nolan',
    birthDate: '1970-07-30',
    age: 54,
    knownFor: 'Oppenheimer, Inception, Interstellar',
    role: 'Director',
    profilePath: 'https://image.tmdb.org/t/p/w185/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg',
    topTitles: ['Oppenheimer', 'Interstellar', 'The Dark Knight']
  },
  {
    id: 2037,
    name: 'Cillian Murphy',
    birthDate: '1976-05-25',
    age: 48,
    knownFor: 'Oppenheimer, Peaky Blinders',
    role: 'Actor',
    profilePath: 'https://image.tmdb.org/t/p/w185/2lKs67r7FI4bPu0AXxMUJZxmUXn.jpg',
    topTitles: ['Oppenheimer', 'Dunkirk', 'Inception']
  },
  {
    id: 1190668,
    name: 'Timothée Chalamet',
    birthDate: '1995-12-27',
    age: 28,
    knownFor: 'Dune: Part Two, Wonka, Interstellar',
    role: 'Actor',
    profilePath: 'https://image.tmdb.org/t/p/w185/dFxpwRpmzpVfP1zjluH68DeQhyj.jpg',
    topTitles: ['Dune: Part Two', 'Interstellar']
  },
  {
    id: 1179460,
    name: 'Pankaj Tripathi',
    birthDate: '1976-09-05',
    age: 48,
    knownFor: 'Mirzapur, Gangs of Wasseypur, Stree',
    role: 'Actor',
    profilePath: 'https://image.tmdb.org/t/p/w185/f3Vxz0QB7PHeyPcXrfJX14Xkxnu.jpg',
    topTitles: ['Mirzapur', 'Sacred Games', 'Stree']
  },
  {
    id: 505710,
    name: 'Zendaya',
    birthDate: '1996-09-01',
    age: 28,
    knownFor: 'Dune: Part Two, Euphoria, Spider-Man',
    role: 'Actor',
    profilePath: 'https://image.tmdb.org/t/p/w185/qGkBlyn1AwQpuFnRARMRwj0iHZp.jpg',
    topTitles: ['Dune: Part Two', 'Challengers']
  },
  {
    id: 1208682,
    name: 'Vikrant Massey',
    birthDate: '1987-04-03',
    age: 37,
    knownFor: '12th Fail, Mirzapur, Sector 36',
    role: 'Actor',
    profilePath: 'https://image.tmdb.org/t/p/w185/zvpP52P7CtVXYONmvWrH1aOcRTx.jpg',
    topTitles: ['12th Fail', 'Mirzapur']
  }
];

export const ALL_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Fantasy', 'History', 'Horror', 'Mystery', 'Romance',
  'Science Fiction', 'Thriller'
];

export const STREAMING_PLATFORMS = [
  { id: 'netflix', name: 'Netflix', logo: 'https://image.tmdb.org/t/p/w92/9A1JSVmSxsya9w326pxv6m.png' },
  { id: 'prime', name: 'Amazon Prime', logo: 'https://image.tmdb.org/t/p/w92/pvsGg12z0p5k1A01Lp.png' },
  { id: 'hotstar', name: 'Disney+ Hotstar', logo: 'https://image.tmdb.org/t/p/w92/7rw.png' },
  { id: 'jiocinema', name: 'JioCinema', logo: 'https://image.tmdb.org/t/p/w92/7rw3q.png' },
  { id: 'zee5', name: 'Zee5', logo: 'https://image.tmdb.org/t/p/w92/zee5.png' },
  { id: 'appletv', name: 'Apple TV', logo: 'https://image.tmdb.org/t/p/w92/peURlLlr8jggOwK53fJ5wdQl05y.png' },
];

export const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
];
