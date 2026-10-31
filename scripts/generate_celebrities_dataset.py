import json
from datetime import datetime

celebrities = [
    # ================= INDIAN CINEMA (BOLLYWOOD & TOLLYWOOD) =================
    {
        "id": "shah-rukh-khan",
        "name": "Shah Rukh Khan",
        "role": "Actor",
        "gender": "male",
        "originCountry": "IN",
        "birthDate": "1965-11-02",
        "birthPlace": "New Delhi, India",
        "profilePath": "https://image.tmdb.org/t/p/w500/1k1bE43V7X6b4XF5kF5w.jpg",
        "bio": "Known as the 'King of Bollywood' and 'Badshah', Shah Rukh Khan has appeared in more than 90 films and earned numerous accolades, including 14 Filmfare Awards and the Padma Shri from the Government of India.",
        "awards": "14 Filmfare Awards, Padma Shri, Legion of Honour",
        "topTitles": ["Jawan", "Pathaan", "Dilwale Dulhania Le Jayenge", "Swades", "Chak De! India", "My Name Is Khan"],
        "trendingRank": 1
    },
    {
        "id": "amitabh-bachchan",
        "name": "Amitabh Bachchan",
        "role": "Actor",
        "gender": "male",
        "originCountry": "IN",
        "birthDate": "1942-10-11",
        "birthPlace": "Allahabad, Uttar Pradesh, India",
        "profilePath": "https://image.tmdb.org/t/p/w500/1XW9kKzH7w4R8m7X.jpg",
        "bio": "Widely regarded as one of the most influential actors in the history of Indian cinema, dubbed the 'Shahenshah of Bollywood' and 'Star of the Millennium' across his six-decade career.",
        "awards": "4 National Film Awards, Dadasaheb Phalke Award, Padma Vibhushan",
        "topTitles": ["Kalki 2898 AD", "Sholay", "Deewaar", "Black", "Piku", "Agneepath"],
        "trendingRank": 5
    },
    {
        "id": "deepika-padukone",
        "name": "Deepika Padukone",
        "role": "Actress",
        "gender": "female",
        "originCountry": "IN",
        "birthDate": "1986-01-05",
        "birthPlace": "Copenhagen, Denmark",
        "profilePath": "https://image.tmdb.org/t/p/w500/8J19kKz7Xw4R8m7X.jpg",
        "bio": "One of the highest-paid actresses in India, Deepika Padukone is known for her commanding screen presence across blockbusters and auteur films, featuring on Time's 100 most influential people list.",
        "awards": "3 Filmfare Awards, Time 100 Impact Award",
        "topTitles": ["Kalki 2898 AD", "Jawan", "Padmaavat", "Piku", "Bajirao Mastani", "Om Shanti Om"],
        "trendingRank": 2
    },
    {
        "id": "alia-bhatt",
        "name": "Alia Bhatt",
        "role": "Actress",
        "gender": "female",
        "originCountry": "IN",
        "birthDate": "1993-03-15",
        "birthPlace": "Mumbai, Maharashtra, India",
        "profilePath": "https://image.tmdb.org/t/p/w500/9kKz7Xw4R8m7X12.jpg",
        "bio": "Acclaimed for her versatile performances across mainstream dramas and character studies, Bhatt won the National Film Award for Best Actress for Gangubai Kathiawadi.",
        "awards": "National Film Award, 5 Filmfare Awards",
        "topTitles": ["RRR", "Gangubai Kathiawadi", "Raazi", "Gully Boy", "Highway", "Brahmastra"],
        "trendingRank": 4
    },
    {
        "id": "prabhas",
        "name": "Prabhas",
        "role": "Actor",
        "gender": "male",
        "originCountry": "IN",
        "birthDate": "1979-10-23",
        "birthPlace": "Chennai, Tamil Nadu, India",
        "profilePath": "https://image.tmdb.org/t/p/w500/prabhas_prof.jpg",
        "bio": "Pan-Indian superstar who attained historic worldwide fame with S.S. Rajamouli's epic Baahubali duology, followed by blockbuster epics including Kalki 2898 AD and Salaar.",
        "awards": "Nandi Award, SIIMA Award",
        "topTitles": ["Kalki 2898 AD", "Baahubali: The Beginning", "Baahubali 2: The Conclusion", "Salaar", "Mirchi"],
        "trendingRank": 3
    },
    {
        "id": "ranbir-kapoor",
        "name": "Ranbir Kapoor",
        "role": "Actor",
        "gender": "male",
        "originCountry": "IN",
        "birthDate": "1982-09-28",
        "birthPlace": "Mumbai, Maharashtra, India",
        "profilePath": "https://image.tmdb.org/t/p/w500/ranbir_prof.jpg",
        "bio": "One of Hindi cinema's finest actors, renowned for complex psychological character portrayals in Rockstar, Barfi!, Sanju, and the record-breaking blockbuster Animal.",
        "awards": "6 Filmfare Awards",
        "topTitles": ["Animal", "Rockstar", "Barfi!", "Sanju", "Yeh Jawaani Hai Deewani"],
        "trendingRank": 6
    },
    {
        "id": "allu-arjun",
        "name": "Allu Arjun",
        "role": "Actor",
        "gender": "male",
        "originCountry": "IN",
        "birthDate": "1982-04-08",
        "birthPlace": "Chennai, Tamil Nadu, India",
        "profilePath": "https://image.tmdb.org/t/p/w500/alluarjun_prof.jpg",
        "bio": "Revered as the 'Icon Star' and master dancer, Allu Arjun became the first Telugu actor to win the National Film Award for Best Actor for his sensational performance in Pushpa: The Rise.",
        "awards": "National Film Award, 6 Filmfare Awards South",
        "topTitles": ["Pushpa: The Rise", "Pushpa 2: The Rule", "Ala Vaikunthapurramuloo", "Arya"],
        "trendingRank": 7
    },
    {
        "id": "ss-rajamouli",
        "name": "S. S. Rajamouli",
        "role": "Director",
        "gender": "male",
        "originCountry": "IN",
        "birthDate": "1973-10-10",
        "birthPlace": "Manvi, Karnataka, India",
        "profilePath": "https://image.tmdb.org/t/p/w500/rajamouli_prof.jpg",
        "bio": "Visionary Indian filmmaker who revolutionized Indian cinema on the global stage with Baahubali and RRR, winning the New York Film Critics Circle Award for Best Director.",
        "awards": "3 National Film Awards, Padma Shri, NYFCC Best Director",
        "topTitles": ["RRR", "Baahubali 2: The Conclusion", "Baahubali: The Beginning", "Eega", "Magadheera"],
        "trendingRank": 8
    },
    {
        "id": "pankaj-tripathi",
        "name": "Pankaj Tripathi",
        "role": "Actor",
        "gender": "male",
        "originCountry": "IN",
        "birthDate": "1976-09-05",
        "birthPlace": "Belsand, Bihar, India",
        "profilePath": "https://image.tmdb.org/t/p/w185/f3Vxz0QB7PHeyPcXrfJX14Xkxnu.jpg",
        "bio": "Revered character actor celebrated for his naturalistic performances in Mirzapur, Gangs of Wasseypur, Stree, and Mimi, earning multiple National Film Awards.",
        "awards": "2 National Film Awards, Filmfare Award",
        "topTitles": ["Mirzapur", "Sacred Games", "Stree 2", "Mimi", "Gangs of Wasseypur", "Newton"],
        "trendingRank": 9
    },
    {
        "id": "vikrant-massey",
        "name": "Vikrant Massey",
        "role": "Actor",
        "gender": "male",
        "originCountry": "IN",
        "birthDate": "1987-04-03",
        "birthPlace": "Mumbai, Maharashtra, India",
        "profilePath": "https://image.tmdb.org/t/p/w185/zvpP52P7CtVXYONmvWrH1aOcRTx.jpg",
        "bio": "Critically acclaimed actor who delivered one of Indian cinema's most inspiring performances as Manoj Kumar Sharma in Vidhu Vinod Chopra's 12th Fail.",
        "awards": "Filmfare Critics Award for Best Actor",
        "topTitles": ["12th Fail", "Mirzapur", "A Death in the Gunj", "Sector 36", "Haseen Dillruba"],
        "trendingRank": 10
    },

    # ================= HOLLYWOOD & BRITISH STARS (US & UK) =================
    {
        "id": "christopher-nolan",
        "name": "Christopher Nolan",
        "role": "Director",
        "gender": "male",
        "originCountry": "GB",
        "birthDate": "1970-07-30",
        "birthPlace": "Westminster, London, United Kingdom",
        "profilePath": "https://image.tmdb.org/t/p/w185/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg",
        "bio": "One of the most acclaimed filmmakers of modern cinema, Nolan is known for mind-bending narrative structures, practical effects, and massive box-office triumphs like Oppenheimer and Inception.",
        "awards": "2 Academy Awards (Best Director, Best Picture), BAFTA, Golden Globe",
        "topTitles": ["Oppenheimer", "Inception", "Interstellar", "The Dark Knight", "Dunkirk", "Memento"],
        "trendingRank": 11
    },
    {
        "id": "cillian-murphy",
        "name": "Cillian Murphy",
        "role": "Actor",
        "gender": "male",
        "originCountry": "GB",
        "birthDate": "1976-05-25",
        "birthPlace": "Douglas, Cork, Ireland",
        "profilePath": "https://image.tmdb.org/t/p/w185/2lKs67r7FI4bPu0AXxMUJZxmUXn.jpg",
        "bio": "Academy Award-winning Irish actor renowned for his chameleon-like performances as J. Robert Oppenheimer and Tommy Shelby in Peaky Blinders.",
        "awards": "Academy Award for Best Actor, BAFTA, Golden Globe, SAG Award",
        "topTitles": ["Oppenheimer", "Peaky Blinders", "28 Days Later", "The Dark Knight", "Inception", "Dunkirk"],
        "trendingRank": 12
    },
    {
        "id": "robert-downey-jr",
        "name": "Robert Downey Jr.",
        "role": "Actor",
        "gender": "male",
        "originCountry": "US",
        "birthDate": "1965-04-04",
        "birthPlace": "Manhattan, New York, USA",
        "profilePath": "https://image.tmdb.org/t/p/w185/5qHNjhtjMD4YWH3fq0lZMBv97vK.jpg",
        "bio": "Academy Award-winning actor famous for defining the Marvel Cinematic Universe as Tony Stark / Iron Man and his transformative performance as Lewis Strauss in Oppenheimer.",
        "awards": "Academy Award for Best Supporting Actor, BAFTA, 3 Golden Globes",
        "topTitles": ["Avengers: Endgame", "Oppenheimer", "Iron Man", "Sherlock Holmes", "Chaplin", "Avengers: Secret Wars"],
        "trendingRank": 13
    },
    {
        "id": "leonardo-dicaprio",
        "name": "Leonardo DiCaprio",
        "role": "Actor",
        "gender": "male",
        "originCountry": "US",
        "birthDate": "1974-11-11",
        "birthPlace": "Los Angeles, California, USA",
        "profilePath": "https://image.tmdb.org/t/p/w500/wo2hx0pE9bBt0r0unMon09v.jpg",
        "bio": "One of Hollywood's greatest leading men, DiCaprio has earned worldwide acclaim for intense, transformative roles across collaborations with Martin Scorsese, Quentin Tarantino, and Christopher Nolan.",
        "awards": "Academy Award for Best Actor, 3 Golden Globes, BAFTA",
        "topTitles": ["Inception", "The Wolf of Wall Street", "The Revenant", "Titanic", "Shutter Island", "Killers of the Flower Moon"],
        "trendingRank": 14
    },
    {
        "id": "margot-robbie",
        "name": "Margot Robbie",
        "role": "Actress",
        "gender": "female",
        "originCountry": "AU",
        "birthDate": "1990-07-02",
        "birthPlace": "Dalby, Queensland, Australia",
        "profilePath": "https://image.tmdb.org/t/p/w500/rRobbie.jpg",
        "bio": "Powerhouse actress and producer behind LuckyChap Entertainment, renowned for Barbie, The Wolf of Wall Street, I, Tonya, and her iconic turn as Harley Quinn.",
        "awards": "3 Academy Award Nominations, 4 Golden Globe Nominations",
        "topTitles": ["Barbie", "The Wolf of Wall Street", "Once Upon a Time in Hollywood", "Babylon", "I, Tonya"],
        "trendingRank": 15
    },
    {
        "id": "timothee-chalamet",
        "name": "Timothée Chalamet",
        "role": "Actor",
        "gender": "male",
        "originCountry": "US",
        "birthDate": "1995-12-27",
        "birthPlace": "New York City, New York, USA",
        "profilePath": "https://image.tmdb.org/t/p/w185/dFxpwRpmzpVfP1zjluH68DeQhyj.jpg",
        "bio": "Celebrated leading man of his generation, starring as Paul Atreides in Denis Villeneuve's Dune franchise, Wonka, and Call Me by Your Name.",
        "awards": "Academy Award Nomination, 3 Golden Globe Nominations",
        "topTitles": ["Dune: Part Two", "Dune", "Wonka", "Call Me by Your Name", "Interstellar", "Little Women"],
        "trendingRank": 16
    },
    {
        "id": "zendaya",
        "name": "Zendaya",
        "role": "Actress",
        "gender": "female",
        "originCountry": "US",
        "birthDate": "1996-09-01",
        "birthPlace": "Oakland, California, USA",
        "profilePath": "https://image.tmdb.org/t/p/w185/qGkBlyn1AwQpuFnRARMRwj0iHZp.jpg",
        "bio": "Multi-Emmy Award-winning actress and cultural icon, praised for her magnetic work in HBO's Euphoria, Challengers, Dune, and Marvel's Spider-Man trilogy.",
        "awards": "2 Primetime Emmy Awards, Golden Globe Award",
        "topTitles": ["Dune: Part Two", "Euphoria", "Challengers", "Spider-Man: No Way Home", "The Greatest Showman"],
        "trendingRank": 17
    },
    {
        "id": "scarlett-johansson",
        "name": "Scarlett Johansson",
        "role": "Actress",
        "gender": "female",
        "originCountry": "US",
        "birthDate": "1984-11-22",
        "birthPlace": "New York City, New York, USA",
        "profilePath": "https://image.tmdb.org/t/p/w500/scarlett_prof.jpg",
        "bio": "The world's highest-grossing actress of all time, Johansson earned dual Oscar nominations in the same year for Marriage Story and Jojo Rabbit, and starred as Natasha Romanoff / Black Widow.",
        "awards": "BAFTA Award, 2 Academy Award Nominations",
        "topTitles": ["Avengers: Endgame", "Marriage Story", "Lost in Translation", "Her", "Lucy", "Jojo Rabbit"],
        "trendingRank": 18
    },
    {
        "id": "christian-bale",
        "name": "Christian Bale",
        "role": "Actor",
        "gender": "male",
        "originCountry": "GB",
        "birthDate": "1974-01-30",
        "birthPlace": "Haverfordwest, Pembrokeshire, Wales, UK",
        "profilePath": "https://image.tmdb.org/t/p/w500/bale_prof.jpg",
        "bio": "Legendary method actor famed for drastic physical transformations and intense dedication, delivering definitive turns as Batman in The Dark Knight trilogy, The Prestige, and The Fighter.",
        "awards": "Academy Award for Best Supporting Actor, 2 Golden Globes",
        "topTitles": ["The Dark Knight", "American Psycho", "The Prestige", "The Fighter", "Ford v Ferrari", "Batman Begins"],
        "trendingRank": 19
    },
    {
        "id": "emma-stone",
        "name": "Emma Stone",
        "role": "Actress",
        "gender": "female",
        "originCountry": "US",
        "birthDate": "1988-11-06",
        "birthPlace": "Scottsdale, Arizona, USA",
        "profilePath": "https://image.tmdb.org/t/p/w500/stone_prof.jpg",
        "bio": "Two-time Academy Award-winning actress renowned for her fearless versatility in Yorgos Lanthimos' Poor Things, La La Land, The Favourite, and Birdman.",
        "awards": "2 Academy Awards (Best Actress), 2 BAFTAs, 2 Golden Globes",
        "topTitles": ["Poor Things", "La La Land", "The Favourite", "Cruella", "Easy A", "Birdman"],
        "trendingRank": 20
    },

    # ================= KOREAN CINEMA & K-DRAMA (SOUTH KOREA) =================
    {
        "id": "song-kang-ho",
        "name": "Song Kang-ho",
        "role": "Actor",
        "gender": "male",
        "originCountry": "KR",
        "birthDate": "1967-01-17",
        "birthPlace": "Gimhae, South Gyeongsang, South Korea",
        "profilePath": "https://image.tmdb.org/t/p/w500/songkangho.jpg",
        "bio": "Titan of South Korean cinema who gained international prominence for his leading roles in Bong Joon-ho's Parasite, Memories of Murder, Snowpiercer, and Broker (Cannes Best Actor).",
        "awards": "Cannes Film Festival Best Actor, SAG Award",
        "topTitles": ["Parasite", "Memories of Murder", "Snowpiercer", "A Taxi Driver", "The Host", "Broker"],
        "trendingRank": 21
    },
    {
        "id": "lee-jung-jae",
        "name": "Lee Jung-jae",
        "role": "Actor",
        "gender": "male",
        "originCountry": "KR",
        "birthDate": "1972-12-15",
        "birthPlace": "Seoul, South Korea",
        "profilePath": "https://image.tmdb.org/t/p/w500/leejungjae.jpg",
        "bio": "Acclaimed South Korean actor who made television history winning the Primetime Emmy Award for Outstanding Lead Actor in a Drama Series for Squid Game.",
        "awards": "Primetime Emmy Award, SAG Award, Critics' Choice Award",
        "topTitles": ["Squid Game", "Hunt", "New World", "The Thieves", "Deliver Us from Evil", "The Acolyte"],
        "trendingRank": 22
    },
    {
        "id": "bong-joon-ho",
        "name": "Bong Joon-ho",
        "role": "Director",
        "gender": "male",
        "originCountry": "KR",
        "birthDate": "1969-09-14",
        "birthPlace": "Daegu, South Korea",
        "profilePath": "https://image.tmdb.org/t/p/w500/bongjoonho.jpg",
        "bio": "Groundbreaking South Korean filmmaker who made Oscar history with Parasite, becoming the first non-English language film to win Best Picture, alongside Palme d'Or at Cannes.",
        "awards": "3 Academy Awards (Best Director, Picture, Screenplay), Palme d'Or",
        "topTitles": ["Parasite", "Memories of Murder", "Snowpiercer", "The Host", "Mother", "Mickey 17"],
        "trendingRank": 23
    },
    {
        "id": "son-ye-jin",
        "name": "Son Ye-jin",
        "role": "Actress",
        "gender": "female",
        "originCountry": "KR",
        "birthDate": "1982-01-11",
        "birthPlace": "Daegu, South Korea",
        "profilePath": "https://image.tmdb.org/t/p/w500/sonyejin.jpg",
        "bio": "Queen of Korean melodrama and romance, Son Ye-jin won global devotion for Crash Landing on You, Something in the Rain, and classic films The Classic and A Moment to Remember.",
        "awards": "Grand Bell Award, Baeksang Arts Award",
        "topTitles": ["Crash Landing on You", "The Classic", "A Moment to Remember", "Something in the Rain", "The Negotiation"],
        "trendingRank": 24
    },
    {
        "id": "hyun-bin",
        "name": "Hyun Bin",
        "role": "Actor",
        "gender": "male",
        "originCountry": "KR",
        "birthDate": "1982-09-25",
        "birthPlace": "Seoul, South Korea",
        "profilePath": "https://image.tmdb.org/t/p/w500/hyunbin.jpg",
        "bio": "Celebrated Hallyu superstar famed across Asia for his charismatic roles in Crash Landing on You, Secret Garden, Memories of the Alhambra, and Confidential Assignment.",
        "awards": "Baeksang Arts Awards Grand Prize",
        "topTitles": ["Crash Landing on You", "Secret Garden", "Confidential Assignment", "Memories of the Alhambra", "Harbin"],
        "trendingRank": 25
    },

    # ================= JAPANESE CINEMA & ANIME (JAPAN) =================
    {
        "id": "hayao-miyazaki",
        "name": "Hayao Miyazaki",
        "role": "Director",
        "gender": "male",
        "originCountry": "JP",
        "birthDate": "1941-01-05",
        "birthPlace": "Bunkyo, Tokyo, Japan",
        "profilePath": "https://image.tmdb.org/t/p/w500/miyazaki.jpg",
        "bio": "Co-founder of Studio Ghibli and revered anime master, Miyazaki is celebrated worldwide as the Walt Disney of Japan with masterpieces Spirited Away, The Boy and the Heron, and Princess Mononoke.",
        "awards": "2 Academy Awards (Best Animated Feature), Academy Honorary Award",
        "topTitles": ["Spirited Away", "Princess Mononoke", "The Boy and the Heron", "My Neighbor Totoro", "Howl's Moving Castle"],
        "trendingRank": 26
    },
    {
        "id": "hiroyuki-sanada",
        "name": "Hiroyuki Sanada",
        "role": "Actor",
        "gender": "male",
        "originCountry": "JP",
        "birthDate": "1960-10-12",
        "birthPlace": "Shinagawa, Tokyo, Japan",
        "profilePath": "https://image.tmdb.org/t/p/w500/sanada.jpg",
        "bio": "Distinguished Japanese martial artist and actor who made Emmy history winning Best Actor in a Drama Series for FX's Shōgun, alongside iconic turns in John Wick 4 and The Last Samurai.",
        "awards": "Primetime Emmy Award for Best Lead Actor, Japanese Academy Award",
        "topTitles": ["Shōgun", "The Last Samurai", "John Wick: Chapter 4", "The Twilight Samurai", "Ring", "Bullet Train"],
        "trendingRank": 27
    },
    {
        "id": "ken-watanabe",
        "name": "Ken Watanabe",
        "role": "Actor",
        "gender": "male",
        "originCountry": "JP",
        "birthDate": "1959-10-21",
        "birthPlace": "Koide, Niigata, Japan",
        "profilePath": "https://image.tmdb.org/t/p/w500/watanabe.jpg",
        "bio": "Internationally renowned Japanese actor famous for his Oscar-nominated performance in The Last Samurai and key roles in Christopher Nolan's Inception and Batman Begins.",
        "awards": "Academy Award Nomination, 2 Japan Academy Film Prizes",
        "topTitles": ["The Last Samurai", "Inception", "Batman Begins", "Memoirs of a Geisha", "Tokyo Vice", "Letters from Iwo Jima"],
        "trendingRank": 28
    },

    # ================= EUROPEAN & GLOBAL STARS =================
    {
        "id": "penelope-cruz",
        "name": "Penélope Cruz",
        "role": "Actress",
        "gender": "female",
        "originCountry": "ES",
        "birthDate": "1974-04-28",
        "birthPlace": "Alcobendas, Madrid, Spain",
        "profilePath": "https://image.tmdb.org/t/p/w500/cruz.jpg",
        "bio": "The first Spanish actress in history to receive an Academy Award and a star on the Hollywood Walk of Fame, celebrated for her collaborations with Pedro Almodóvar and Woody Allen.",
        "awards": "Academy Award for Best Supporting Actress, BAFTA, 3 Goya Awards",
        "topTitles": ["Vicky Cristina Barcelona", "Volver", "Parallel Mothers", "All About My Mother", "Ferrari"],
        "trendingRank": 29
    },
    {
        "id": "mads-mikkelsen",
        "name": "Mads Mikkelsen",
        "role": "Actor",
        "gender": "male",
        "originCountry": "DE",
        "birthDate": "1965-11-22",
        "birthPlace": "Copenhagen, Denmark",
        "profilePath": "https://image.tmdb.org/t/p/w500/mikkelsen.jpg",
        "bio": "Celebrated Danish and international actor famed for his chilling elegance as Hannibal Lecter, Casino Royale villain Le Chiffre, and Danish masterpieces Another Round and The Hunt.",
        "awards": "Cannes Best Actor, European Film Award",
        "topTitles": ["Another Round", "The Hunt", "Casino Royale", "Hannibal", "Rogue One", "Doctor Strange"],
        "trendingRank": 30
    },
    {
        "id": "marion-cotillard",
        "name": "Marion Cotillard",
        "role": "Actress",
        "gender": "female",
        "originCountry": "FR",
        "birthDate": "1975-09-30",
        "birthPlace": "Paris, France",
        "profilePath": "https://image.tmdb.org/t/p/w500/cotillard.jpg",
        "bio": "Iconic French actress who won the Academy Award for Best Actress for her portrayal of Édith Piaf in La Vie en Rose, the first Oscar awarded for a French-language role.",
        "awards": "Academy Award for Best Actress, BAFTA, 2 César Awards",
        "topTitles": ["La Vie en Rose", "Inception", "The Dark Knight Rises", "Two Days, One Night", "Midnight in Paris", "Rust and Bone"],
        "trendingRank": 31
    },
    {
        "id": "wagner-moura",
        "name": "Wagner Moura",
        "role": "Actor",
        "gender": "male",
        "originCountry": "BR",
        "birthDate": "1976-06-27",
        "birthPlace": "Salvador, Bahia, Brazil",
        "profilePath": "https://image.tmdb.org/t/p/w500/moura.jpg",
        "bio": "Acclaimed Brazilian actor and filmmaker who achieved worldwide recognition for his commanding performance as Pablo Escobar in Netflix's Narcos and Captain Nascimento in Elite Squad.",
        "awards": "Golden Globe Nomination, Cinema Brazil Grand Prize",
        "topTitles": ["Narcos", "Elite Squad", "Elite Squad: The Enemy Within", "Civil War", "Mr. & Mrs. Smith"],
        "trendingRank": 32
    }
]

# Calculate age dynamically
now_year = datetime.now().year
for c in celebrities:
    b_year = int(c['birthDate'][:4])
    c['age'] = now_year - b_year

# Write as typescript module src/lib/data/celebrities.ts
ts_code = f"""import {{ Celebrity }} from '@/types/movie';

export interface DetailedCelebrity extends Celebrity {{
  gender?: 'male' | 'female';
  originCountry: string;
  birthPlace: string;
  bio: string;
  awards: string;
  trendingRank: number;
}}

export const ALL_CELEBRITIES: DetailedCelebrity[] = {json.dumps(celebrities, indent=2, ensure_ascii=False)};
"""

with open('src/lib/data/celebrities.ts', 'w', encoding='utf-8') as f:
    f.write(ts_code)

print(f"Generated src/lib/data/celebrities.ts with {len(celebrities)} celebrities!")

