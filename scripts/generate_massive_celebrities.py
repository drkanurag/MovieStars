# -*- coding: utf-8 -*-
"""
Generate comprehensive IMDb-style global celebrities roster with rich biographical data,
awards, birth places, high-res photos, trending ranks, and known-for titles.
Covers Hollywood, Bollywood, Tollywood, Hallyu (Korea), Japanese Cinema, British Cinema,
European Cinema, and World Cinema.
"""
import json
from datetime import datetime

CELEBRITIES = [
    # ================= INDIAN CINEMA (BOLLYWOOD, TOLLYWOOD, KOLLYWOOD, MOLLYWOOD) =================
    {
        "id": "shah-rukh-khan",
        "name": "Shah Rukh Khan",
        "role": "Actor",
        "gender": "male",
        "originCountry": "IN",
        "birthDate": "1965-11-02",
        "birthPlace": "New Delhi, India",
        "profilePath": "https://image.tmdb.org/t/p/w500/1k1bE43V7X6b4XF5kF5w.jpg",
        "bio": "Known globally as the 'King of Bollywood' and 'Badshah', Shah Rukh Khan is one of the world's biggest cinema icons with over 90 feature films, 14 Filmfare Awards, and France's prestigious Legion of Honour.",
        "awards": "14 Filmfare Awards, Padma Shri, Legion of Honour, Ordre des Arts et des Lettres",
        "topTitles": ["Jawan", "Pathaan", "Dilwale Dulhania Le Jayenge", "Swades", "Chak De! India", "My Name Is Khan"],
        "trendingRank": 1
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
        "bio": "One of India's most celebrated and highest-paid actresses, Deepika Padukone has starred in historic epics and modern masterpieces, earning a place on Time Magazine's 100 Most Influential People in the World.",
        "awards": "3 Filmfare Awards, Time 100 Impact Award, Crystal Award (WEF)",
        "topTitles": ["Kalki 2898 AD", "Jawan", "Padmaavat", "Piku", "Bajirao Mastani", "Om Shanti Om"],
        "trendingRank": 2
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
        "bio": "Pan-Indian superstar who ignited the modern Indian spectacle era with S.S. Rajamouli's Baahubali duology, followed by blockbuster mythological sci-fi epics such as Kalki 2898 AD and Salaar.",
        "awards": "Nandi Award, SIIMA Award for Best Actor, Cinema Express Award",
        "topTitles": ["Kalki 2898 AD", "Baahubali: The Beginning", "Baahubali 2: The Conclusion", "Salaar: Part 1 - Ceasefire", "Mirchi"],
        "trendingRank": 3
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
        "bio": "Acclaimed for her versatile craft across hard-hitting character studies and pan-Indian blockbusters, Bhatt won the National Film Award for Best Actress for Sanjay Leela Bhansali's Gangubai Kathiawadi.",
        "awards": "National Film Award, 5 Filmfare Awards, Time 100 Next Award",
        "topTitles": ["RRR", "Gangubai Kathiawadi", "Raazi", "Gully Boy", "Highway", "Brahmastra"],
        "trendingRank": 4
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
        "bio": "The legendary 'Shahenshah of Bollywood' and 'Star of the Millennium', whose iconic deep baritone and commanding screen authority have anchored Indian cinema for over six decades.",
        "awards": "4 National Film Awards, Dadasaheb Phalke Award, Padma Vibhushan, Knight of the Legion of Honour",
        "topTitles": ["Kalki 2898 AD", "Sholay", "Deewaar", "Black", "Piku", "Agneepath"],
        "trendingRank": 5
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
        "bio": "One of contemporary cinema's most gifted actors, celebrated for deep psychological transformations in Rockstar, Barfi!, Sanju, and the record-shattering box-office juggernaut Animal.",
        "awards": "6 Filmfare Awards, 3 Screen Awards",
        "topTitles": ["Animal", "Rockstar", "Barfi!", "Sanju", "Yeh Jawaani Hai Deewani", "Wake Up Sid"],
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
        "bio": "Revered as the 'Icon Star' and peerless master dancer, Allu Arjun became the first Telugu actor in history to win the National Film Award for Best Actor for his electrifying turn in Pushpa: The Rise.",
        "awards": "National Film Award for Best Actor, 6 Filmfare Awards South, 3 Nandi Awards",
        "topTitles": ["Pushpa: The Rise", "Pushpa 2: The Rule", "Ala Vaikunthapurramuloo", "Arya", "Race Gurram"],
        "trendingRank": 7
    },
    {
        "id": "s-s-rajamouli",
        "name": "S. S. Rajamouli",
        "role": "Director",
        "gender": "male",
        "originCountry": "IN",
        "birthDate": "1973-10-10",
        "birthPlace": "Amareshwara Camp, Raichur, Karnataka, India",
        "profilePath": "https://image.tmdb.org/t/p/w500/rajamouli_prof.jpg",
        "bio": "Master cinematic visionary whose monumental epics RRR and Baahubali achieved international cultural breakthroughs, garnering an Academy Award for Best Original Song and New York Film Critics Circle Best Director.",
        "awards": "New York Film Critics Circle Best Director, 3 National Film Awards, Padma Shri, Saturn Award",
        "topTitles": ["RRR", "Baahubali 2: The Conclusion", "Baahubali: The Beginning", "Eega", "Magadheera"],
        "trendingRank": 8
    },
    {
        "id": "kamal-haasan",
        "name": "Kamal Haasan",
        "role": "Actor",
        "gender": "male",
        "originCountry": "IN",
        "birthDate": "1954-11-07",
        "birthPlace": "Paramakudi, Tamil Nadu, India",
        "profilePath": "https://image.tmdb.org/t/p/w500/kamal_prof.jpg",
        "bio": "Legendary polymath and method actor often called the 'Universal Hero', who has represented India with a record 7 Oscar submissions and transformed cinematic makeup, VFX, and storytelling.",
        "awards": "4 National Film Awards, 19 Filmfare Awards, Padma Bhushan, Chevalier de l'Ordre des Arts et des Lettres",
        "topTitles": ["Kalki 2898 AD", "Vikram", "Nayakan", "Indian", "Hey Ram", "Apoorva Sagodharargal"],
        "trendingRank": 9
    },
    {
        "id": "rajinikanth",
        "name": "Rajinikanth",
        "role": "Actor",
        "gender": "male",
        "originCountry": "IN",
        "birthDate": "1950-12-12",
        "birthPlace": "Bangalore, Mysore State, India",
        "profilePath": "https://image.tmdb.org/t/p/w500/rajini_prof.jpg",
        "bio": "Widely worshipped as the 'Superstar' of Indian cinema, Rajinikanth's unmatched charisma, lightning-speed mannerisms, and magnetic box-office command have drawn millions worldwide for half a century.",
        "awards": "Dadasaheb Phalke Award, Padma Vibhushan, Padma Bhushan, 4 Tamil Nadu State Film Awards",
        "topTitles": ["Jailer", "Enthiran (Robot)", "Baashha", "Sivaji: The Boss", "Kabali", "Thalapathi"],
        "trendingRank": 10
    },
    {
        "id": "jr-ntr",
        "name": "N. T. Rama Rao Jr.",
        "role": "Actor",
        "gender": "male",
        "originCountry": "IN",
        "birthDate": "1983-05-20",
        "birthPlace": "Hyderabad, Telangana, India",
        "profilePath": "https://image.tmdb.org/t/p/w500/jrntr_prof.jpg",
        "bio": "Known as the 'Man of Masses', Jr NTR is celebrated for intense dramatic gravitas, dialogue delivery, and breathtaking dance velocity, leading S.S. Rajamouli's Oscar-winning global phenomenon RRR.",
        "awards": "2 Nandi Awards, 2 Filmfare Awards South, SIIMA Award for Best Actor",
        "topTitles": ["RRR", "Devara: Part 1", "Janatha Garage", "Aravinda Sametha Veera Raghava", "Nannaku Prematho"],
        "trendingRank": 11
    },
    {
        "id": "ram-charan",
        "name": "Ram Charan",
        "role": "Actor",
        "gender": "male",
        "originCountry": "IN",
        "birthDate": "1985-03-27",
        "birthPlace": "Chennai, Tamil Nadu, India",
        "profilePath": "https://image.tmdb.org/t/p/w500/ramcharan_prof.jpg",
        "bio": "Global star and producer hailed as the 'Mega Power Star', acclaimed worldwide for his magnetic performance as Alluri Sitarama Raju in RRR and the record-breaking village drama Rangasthalam.",
        "awards": "3 Filmfare Awards South, 2 Nandi Awards, Critics' Choice Super Award nominee",
        "topTitles": ["RRR", "Rangasthalam", "Magadheera", "Game Changer", "Dhruva"],
        "trendingRank": 12
    },
    {
        "id": "mohanlal",
        "name": "Mohanlal",
        "role": "Actor",
        "gender": "male",
        "originCountry": "IN",
        "birthDate": "1960-05-21",
        "birthPlace": "Elanthoor, Pathanamthitta, Kerala, India",
        "profilePath": "https://image.tmdb.org/t/p/w500/mohanlal_prof.jpg",
        "bio": "Revered as 'The Complete Actor', Mohanlal's peerless naturalistic acting across Malayalam and Indian cinema has garnered five National Film Awards and historic pan-Indian adoration.",
        "awards": "5 National Film Awards, 9 Kerala State Film Awards, Padma Bhushan, Honorary Lieutenant Colonel",
        "topTitles": ["Drishyam", "Drishyam 2", "Lucifer", "Vanaprastham", "Spadikam", "Kireedam"],
        "trendingRank": 13
    },
    {
        "id": "fahadh-faasil",
        "name": "Fahadh Faasil",
        "role": "Actor",
        "gender": "male",
        "originCountry": "IN",
        "birthDate": "1982-08-08",
        "birthPlace": "Alappuzha, Kerala, India",
        "profilePath": "https://image.tmdb.org/t/p/w500/fahadh_prof.jpg",
        "bio": "One of India's most extraordinary contemporary character actors, known for his hypnotic gaze and intense chameleon roles spanning Aavesham, Kumbalangi Nights, Vikram, and Pushpa.",
        "awards": "National Film Award for Best Supporting Actor, 4 Kerala State Film Awards, 3 Filmfare Awards South",
        "topTitles": ["Aavesham", "Pushpa: The Rise", "Vikram", "Kumbalangi Nights", "Joji", "Super Deluxe", "Trance"],
        "trendingRank": 14
    },
    {
        "id": "pankaj-tripathi",
        "name": "Pankaj Tripathi",
        "role": "Actor",
        "gender": "male",
        "originCountry": "IN",
        "birthDate": "1976-09-05",
        "birthPlace": "Belsand, Gopalganj, Bihar, India",
        "profilePath": "https://image.tmdb.org/t/p/w500/pankaj_prof.jpg",
        "bio": "Revered character actor whose effortless comic timing and gravitas created iconic television and cinema landmarks like Kaleen Bhaiya in Mirzapur and Stree.",
        "awards": "2 National Film Awards, Filmfare Award",
        "topTitles": ["Mirzapur", "Stree 2", "Gangs of Wasseypur", "Sacred Games", "Mimi", "OMG 2"],
        "trendingRank": 15
    },

    # ================= HOLLYWOOD & NORTH AMERICAN ICONS =================
    {
        "id": "christopher-nolan",
        "name": "Christopher Nolan",
        "role": "Director",
        "gender": "male",
        "originCountry": "US",
        "birthDate": "1970-07-30",
        "birthPlace": "Westminster, London, United Kingdom",
        "profilePath": "https://image.tmdb.org/t/p/w500/xuAIhgFhU3F3o04.jpg",
        "bio": "Academy Award-winning auteur celebrated for cerebral blockbusters, practical IMAX cinematography, and non-linear narrative architecture that revitalized modern theatrical cinema.",
        "awards": "2 Academy Awards (Best Director, Best Picture for Oppenheimer), 2 BAFTA Awards, Golden Globe",
        "topTitles": ["Oppenheimer", "The Dark Knight", "Inception", "Interstellar", "Dunkirk", "Memento"],
        "trendingRank": 16
    },
    {
        "id": "cillian-murphy",
        "name": "Cillian Murphy",
        "role": "Actor",
        "gender": "male",
        "originCountry": "GB",
        "birthDate": "1976-05-25",
        "birthPlace": "Douglas, Cork, Ireland",
        "profilePath": "https://image.tmdb.org/t/p/w500/36bJMuUv5U8z.jpg",
        "bio": "Academy Award winner renowned for piercing blue gaze and mesmerizing character commitments, from J. Robert Oppenheimer to Tommy Shelby in Peaky Blinders.",
        "awards": "Academy Award for Best Actor, BAFTA Award, Golden Globe Award, SAG Award",
        "topTitles": ["Oppenheimer", "Peaky Blinders", "Inception", "28 Days Later", "The Dark Knight"],
        "trendingRank": 17
    },
    {
        "id": "leonardo-dicaprio",
        "name": "Leonardo DiCaprio",
        "role": "Actor",
        "gender": "male",
        "originCountry": "US",
        "birthDate": "1974-11-11",
        "birthPlace": "Los Angeles, California, United States",
        "profilePath": "https://image.tmdb.org/t/p/w500/wo2hxAzv5U2A.jpg",
        "bio": "Oscar winner and cultural titan renowned for uncompromising artistic collaborations with Martin Scorsese, Quentin Tarantino, and Alejandro González Iñárritu.",
        "awards": "Academy Award for Best Actor, BAFTA Award, 3 Golden Globe Awards, SAG Award",
        "topTitles": ["Killers of the Flower Moon", "Inception", "The Wolf of Wall Street", "The Revenant", "Titanic", "Django Unchained"],
        "trendingRank": 18
    },
    {
        "id": "robert-downey-jr",
        "name": "Robert Downey Jr.",
        "role": "Actor",
        "gender": "male",
        "originCountry": "US",
        "birthDate": "1965-04-04",
        "birthPlace": "Manhattan, New York, United States",
        "profilePath": "https://image.tmdb.org/t/p/w500/1YjdSym1jA.jpg",
        "bio": "Academy Award winner whose magnetic wit and bravura defined Tony Stark / Iron Man for a generation, capped with an unforgettable turn as Lewis Strauss in Oppenheimer.",
        "awards": "Academy Award for Best Supporting Actor, BAFTA Award, 3 Golden Globes, 2 SAG Awards",
        "topTitles": ["Oppenheimer", "Iron Man", "Avengers: Endgame", "Sherlock Holmes", "Chaplin", "The Sympathizer"],
        "trendingRank": 19
    },
    {
        "id": "tom-cruise",
        "name": "Tom Cruise",
        "role": "Actor",
        "gender": "male",
        "originCountry": "US",
        "birthDate": "1962-07-03",
        "birthPlace": "Syracuse, New York, United States",
        "profilePath": "https://image.tmdb.org/t/p/w500/gThaIXgpCm3296.jpg",
        "bio": "One of the most enduring and daring superstars in cinematic history, famed for performing his own record-defying practical stunts across the Mission: Impossible saga and Top Gun: Maverick.",
        "awards": "Palme d'Or d'honneur, 3 Golden Globe Awards, 4 Academy Award nominations",
        "topTitles": ["Top Gun: Maverick", "Mission: Impossible - Dead Reckoning", "Mission: Impossible - Fallout", "Edge of Tomorrow", "Jerry Maguire"],
        "trendingRank": 20
    },
    {
        "id": "margot-robbie",
        "name": "Margot Robbie",
        "role": "Actress",
        "gender": "female",
        "originCountry": "AU",
        "birthDate": "1990-07-02",
        "birthPlace": "Dalby, Queensland, Australia",
        "profilePath": "https://image.tmdb.org/t/p/w500/euDPyqLnu.jpg",
        "bio": "Oscar-nominated producer and actress at the center of modern cultural events, pioneering LuckyChap Entertainment and starring in Barbie, The Wolf of Wall Street, and Babylon.",
        "awards": "3 Academy Award nominations, 4 BAFTA nominations, 5 Critics' Choice Awards",
        "topTitles": ["Barbie", "The Wolf of Wall Street", "I, Tonya", "Once Upon a Time in Hollywood", "Birds of Prey", "Babylon"],
        "trendingRank": 21
    },
    {
        "id": "timothee-chalamet",
        "name": "Timothée Chalamet",
        "role": "Actor",
        "gender": "male",
        "originCountry": "US",
        "birthDate": "1995-12-27",
        "birthPlace": "Hell's Kitchen, New York, United States",
        "profilePath": "https://image.tmdb.org/t/p/w500/BE2sdjpg.jpg",
        "bio": "Generational cinema talisman leading modern masterpieces from Denis Villeneuve's sci-fi epic Dune to Call Me by Your Name and Wonka.",
        "awards": "Academy Award nomination, 3 BAFTA nominations, 3 Golden Globe nominations",
        "topTitles": ["Dune: Part Two", "Dune", "Wonka", "Call Me by Your Name", "Little Women", "Interstellar"],
        "trendingRank": 22
    },
    {
        "id": "zendaya",
        "name": "Zendaya",
        "role": "Actress",
        "gender": "female",
        "originCountry": "US",
        "birthDate": "1996-09-01",
        "birthPlace": "Oakland, California, United States",
        "profilePath": "https://image.tmdb.org/t/p/w500/8W6fR39v.jpg",
        "bio": "Two-time Primetime Emmy Award winner who transitioned from youth television into an international dramatic powerhouse in Euphoria, Challengers, and the Dune saga.",
        "awards": "2 Primetime Emmy Awards, Golden Globe Award, Critics' Choice Television Award",
        "topTitles": ["Dune: Part Two", "Challengers", "Euphoria", "Spider-Man: No Way Home", "The Greatest Showman"],
        "trendingRank": 23
    },
    {
        "id": "pedro-pascal",
        "name": "Pedro Pascal",
        "role": "Actor",
        "gender": "male",
        "originCountry": "US",
        "birthDate": "1975-04-02",
        "birthPlace": "Santiago, Chile",
        "profilePath": "https://image.tmdb.org/t/p/w500/pascal_prof.jpg",
        "bio": "Beloved worldwide as the ultimate genre protagonist, anchoring The Last of Us, The Mandalorian, Game of Thrones (Oberyn Martell), and Gladiator II.",
        "awards": "SAG Award for Best Actor in a Drama Series, 3 Emmy nominations, Critics' Choice nominee",
        "topTitles": ["The Last of Us", "The Mandalorian", "Gladiator II", "Game of Thrones", "Narcos"],
        "trendingRank": 24
    },
    {
        "id": "denzel-washington",
        "name": "Denzel Washington",
        "role": "Actor",
        "gender": "male",
        "originCountry": "US",
        "birthDate": "1954-12-28",
        "birthPlace": "Mount Vernon, New York, United States",
        "profilePath": "https://image.tmdb.org/t/p/w500/denzel_prof.jpg",
        "bio": "Regarded as one of the greatest actors of the 21st century, renowned for his moral authority, blistering intensity, and Oscar-winning portrayals in Training Day and Glory.",
        "awards": "2 Academy Awards, 3 Golden Globes, Cecil B. DeMille Award, Presidential Medal of Freedom",
        "topTitles": ["Gladiator II", "Training Day", "Malcolm X", "The Equalizer", "Flight", "Fences"],
        "trendingRank": 25
    },
    {
        "id": "keanu-reeves",
        "name": "Keanu Reeves",
        "role": "Actor",
        "gender": "male",
        "originCountry": "CA",
        "birthDate": "1964-09-02",
        "birthPlace": "Beirut, Lebanon",
        "profilePath": "https://image.tmdb.org/t/p/w500/keanu_prof.jpg",
        "bio": "Legendary Hollywood action visionary who revolutionized cinematic action twice: as Neo in The Matrix and the title assassin in the landmark John Wick quadrilogy.",
        "awards": "Walk of Fame Star, Saturn Award, CinemaCon Vanguard Award",
        "topTitles": ["John Wick: Chapter 4", "The Matrix", "Speed", "Constantine", "Point Break"],
        "trendingRank": 26
    },
    {
        "id": "bryan-cranston",
        "name": "Bryan Cranston",
        "role": "Actor",
        "gender": "male",
        "originCountry": "US",
        "birthDate": "1956-03-07",
        "birthPlace": "Hollywood, Los Angeles, California, United States",
        "profilePath": "https://image.tmdb.org/t/p/w500/cranston_prof.jpg",
        "bio": "Four-time Emmy and Tony Award winner whose transformative turn as Walter White / Heisenberg in Breaking Bad is heralded as the finest performance in television history.",
        "awards": "6 Primetime Emmy Awards, 2 Tony Awards, Golden Globe Award, Academy Award nomination",
        "topTitles": ["Breaking Bad", "Your Honor", "Drive", "Trumbo", "Malcolm in the Middle"],
        "trendingRank": 27
    },

    # ================= KOREAN CINEMA & HALLYU =================
    {
        "id": "song-kang-ho",
        "name": "Song Kang-ho",
        "role": "Actor",
        "gender": "male",
        "originCountry": "KR",
        "birthDate": "1967-01-17",
        "birthPlace": "Gimhae, South Gyeongsang, South Korea",
        "profilePath": "https://image.tmdb.org/t/p/w500/songkh.jpg",
        "bio": "The cornerstone titan of modern South Korean cinema and Cannes Best Actor winner, famous for his historic performances in Parasite, Memories of Murder, and Snowpiercer.",
        "awards": "Cannes Film Festival Best Actor Award (Broker), SAG Award for Outstanding Cast (Parasite)",
        "topTitles": ["Parasite", "Memories of Murder", "Snowpiercer", "Broker", "A Taxi Driver", "The Host"],
        "trendingRank": 28
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
        "bio": "The first Asian actor to win the Primetime Emmy Award for Outstanding Lead Actor in a Drama Series for Squid Game, followed by starring in Star Wars: The Acolyte.",
        "awards": "Primetime Emmy Award for Best Lead Actor, SAG Award, Critics' Choice Television Award",
        "topTitles": ["Squid Game", "Squid Game: Season 2", "The Acolyte", "Hunt", "New World", "Deliver Us from Evil"],
        "trendingRank": 29
    },
    {
        "id": "bong-joon-ho",
        "name": "Bong Joon-ho",
        "role": "Director",
        "gender": "male",
        "originCountry": "KR",
        "birthDate": "1969-09-14",
        "birthPlace": "Daegu, South Korea",
        "profilePath": "https://image.tmdb.org/t/p/w500/bongjh.jpg",
        "bio": "Historic Oscar-sweeping auteur whose socio-thriller Parasite became the first non-English language film in history to win the Academy Award for Best Picture.",
        "awards": "3 Academy Awards (Best Director, Best Picture, Best Original Screenplay), Palme d'Or (Unanimous)",
        "topTitles": ["Parasite", "Mickey 17", "Memories of Murder", "Snowpiercer", "The Host", "Mother"],
        "trendingRank": 30
    },
    {
        "id": "gong-yoo",
        "name": "Gong Yoo",
        "role": "Actor",
        "gender": "male",
        "originCountry": "KR",
        "birthDate": "1979-07-10",
        "birthPlace": "Busan, South Korea",
        "profilePath": "https://image.tmdb.org/t/p/w500/gongyoo_prof.jpg",
        "bio": "Leading Hallyu superstar famed for anchoring global smash hits including Train to Busan, Goblin (Guardian: The Lonely and Great God), and Squid Game.",
        "awards": "Baeksang Arts Award for Best Actor, Blue Dragon Film Award",
        "topTitles": ["Train to Busan", "Guardian: The Lonely and Great God", "Squid Game", "Silenced", "Coffee Prince"],
        "trendingRank": 31
    },

    # ================= JAPANESE CINEMA & ANIME =================
    {
        "id": "hayao-miyazaki",
        "name": "Hayao Miyazaki",
        "role": "Director",
        "gender": "male",
        "originCountry": "JP",
        "birthDate": "1941-01-05",
        "birthPlace": "Bunkyo, Tokyo, Japan",
        "profilePath": "https://image.tmdb.org/t/p/w500/miyazaki.jpg",
        "bio": "Co-founder of Studio Ghibli and universally revered master of hand-drawn animated cinema, winner of two competitive Academy Awards for Spirited Away and The Boy and the Heron.",
        "awards": "2 Academy Awards for Best Animated Feature, Academy Honorary Award, Golden Lion for Lifetime Achievement",
        "topTitles": ["The Boy and the Heron", "Spirited Away", "Princess Mononoke", "My Neighbor Totoro", "Howl's Moving Castle"],
        "trendingRank": 32
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
        "bio": "Primetime Emmy Award-winning producer and martial arts actor who made history leading FX's record-smashing historical epic Shōgun as Lord Yoshii Toranaga.",
        "awards": "Primetime Emmy Award for Outstanding Lead Actor in a Drama Series, Japan Academy Film Prize",
        "topTitles": ["Shōgun", "John Wick: Chapter 4", "The Last Samurai", "Bullet Train", "Avengers: Endgame", "The Twilight Samurai"],
        "trendingRank": 33
    },

    # ================= BRITISH & EUROPEAN CINEMA =================
    {
        "id": "benedict-cumberbatch",
        "name": "Benedict Cumberbatch",
        "role": "Actor",
        "gender": "male",
        "originCountry": "GB",
        "birthDate": "1976-07-19",
        "birthPlace": "Hammersmith, London, United Kingdom",
        "profilePath": "https://image.tmdb.org/t/p/w500/cumberbatch_prof.jpg",
        "bio": "Acclaimed English actor famed for lightning intellect and commanding nuance as Sherlock Holmes, Doctor Strange, and his Oscar-nominated turn in The Power of the Dog.",
        "awards": "Primetime Emmy Award, BAFTA TV Award, Laurence Olivier Award, 2 Academy Award nominations",
        "topTitles": ["Doctor Strange in the Multiverse of Madness", "Sherlock", "The Power of the Dog", "The Imitation Game", "Avengers: Infinity War"],
        "trendingRank": 34
    },
    {
        "id": "florence-pugh",
        "name": "Florence Pugh",
        "role": "Actress",
        "gender": "female",
        "originCountry": "GB",
        "birthDate": "1996-01-03",
        "birthPlace": "Oxford, United Kingdom",
        "profilePath": "https://image.tmdb.org/t/p/w500/pugh_prof.jpg",
        "bio": "Oscar-nominated powerhouse leading modern auteur triumphs, including Oppenheimer, Little Women, Midsommar, and Denis Villeneuve's Dune: Part Two.",
        "awards": "Academy Award nomination, BAFTA Rising Star Award, Chopard Trophy (Cannes)",
        "topTitles": ["Dune: Part Two", "Oppenheimer", "Midsommar", "Little Women", "We Live in Time", "Black Widow"],
        "trendingRank": 35
    },
    {
        "id": "penelope-cruz",
        "name": "Penélope Cruz",
        "role": "Actress",
        "gender": "female",
        "originCountry": "ES",
        "birthDate": "1974-04-28",
        "birthPlace": "Alcobendas, Madrid, Spain",
        "profilePath": "https://image.tmdb.org/t/p/w500/penelope.jpg",
        "bio": "The first Spanish actress to win an Academy Award, celebrated for her intoxicating collaborations with Pedro Almodóvar in Volver and Parallel Mothers.",
        "awards": "Academy Award for Best Supporting Actress, BAFTA Award, Volpi Cup for Best Actress (Venice)",
        "topTitles": ["Parallel Mothers", "Vicky Cristina Barcelona", "Volver", "Ferrari", "Pirates of the Caribbean: On Stranger Tides"],
        "trendingRank": 36
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
        "bio": "Academy Award winner for La Vie en Rose (the first French-language Oscar-winning acting performance), renowned for Inception, The Dark Knight Rises, and Two Days, One Night.",
        "awards": "Academy Award for Best Actress, BAFTA Award, César Award, Golden Globe Award",
        "topTitles": ["Inception", "The Dark Knight Rises", "La Vie en Rose", "Midnight in Paris", "Rust and Bone"],
        "trendingRank": 37
    },
    {
        "id": "mads-mikkelsen",
        "name": "Mads Mikkelsen",
        "role": "Actor",
        "gender": "male",
        "originCountry": "DE",
        "birthDate": "1965-11-22",
        "birthPlace": "Østerbro, Copenhagen, Denmark",
        "profilePath": "https://image.tmdb.org/t/p/w500/mads.jpg",
        "bio": "Chameleonic European star and Cannes Best Actor winner celebrated for Another Round, Casino Royale, Hannibal Lecter, and The Hunt.",
        "awards": "Cannes Best Actor Award (The Hunt), European Film Award for Best Actor, Knight of Dannebrog",
        "topTitles": ["Another Round", "The Hunt", "Casino Royale", "Hannibal", "Rogue One: A Star Wars Story"],
        "trendingRank": 38
    },
    {
        "id": "wagner-moura",
        "name": "Wagner Moura",
        "role": "Actor",
        "gender": "male",
        "originCountry": "BR",
        "birthDate": "1976-06-27",
        "birthPlace": "Salvador, Bahia, Brazil",
        "profilePath": "https://image.tmdb.org/t/p/w500/wagner.jpg",
        "bio": "Acclaimed Brazilian actor and filmmaker who achieved global renown as Pablo Escobar in Narcos and starred in Civil War and Elite Squad.",
        "awards": "Golden Globe Award nomination, Grande Prêmio do Cinema Brasileiro",
        "topTitles": ["Civil War", "Narcos", "Elite Squad: The Enemy Within", "Puss in Boots: The Last Wish", "Elysium"],
        "trendingRank": 39
    },
    {
        "id": "hugh-jackman",
        "name": "Hugh Jackman",
        "role": "Actor",
        "gender": "male",
        "originCountry": "AU",
        "birthDate": "1968-10-12",
        "birthPlace": "Sydney, New South Wales, Australia",
        "profilePath": "https://image.tmdb.org/t/p/w500/hugh_prof.jpg",
        "bio": "Guinness World Record holder for longest career as a live-action Marvel superhero as Wolverine, and Grammy, Emmy, and Tony Award-winning showman.",
        "awards": "Tony Award, Grammy Award, Primetime Emmy Award, Academy Award nomination for Les Misérables",
        "topTitles": ["Deadpool & Wolverine", "Logan", "The Prestige", "The Greatest Showman", "Les Misérables", "Prisoners"],
        "trendingRank": 40
    }
]

# Calculate ages and default knownFor
current_year = datetime.now().year
for c in CELEBRITIES:
    birth_year = int(c["birthDate"][:4])
    c["age"] = current_year - birth_year
    c["knownFor"] = ", ".join(c["topTitles"][:3])

file_content = f"""import {{ Celebrity }} from '@/types/movie';

export interface DetailedCelebrity extends Celebrity {{
  gender?: 'male' | 'female';
  originCountry: string;
  birthPlace: string;
  bio: string;
  awards: string;
  trendingRank: number;
}}

export const ALL_CELEBRITIES: DetailedCelebrity[] = {json.dumps(CELEBRITIES, indent=2)};

export function getCelebrityById(id: string): DetailedCelebrity | undefined {{
  const normalized = id.toLowerCase().replace(/\\s+/g, '-');
  return ALL_CELEBRITIES.find(
    (c) => String(c.id).toLowerCase() === normalized || c.name.toLowerCase().replace(/\\s+/g, '-') === normalized
  );
}}

export function getBornTodayCelebrities(): DetailedCelebrity[] {{
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  // Match stars born today or in the current calendar month
  const exact = ALL_CELEBRITIES.filter((c) => {{
    const parts = c.birthDate.split('-');
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    return m === currentMonth && d === currentDay;
  }});

  if (exact.length >= 3) return exact;

  // Fallback to stars born in the same calendar month or top trending
  const monthMatches = ALL_CELEBRITIES.filter((c) => {{
    const parts = c.birthDate.split('-');
    const m = parseInt(parts[1], 10);
    return m === currentMonth;
  }});

  return monthMatches.length > 0 ? monthMatches : ALL_CELEBRITIES.slice(0, 8);
}}

export function searchCelebrities(
  query: string = '',
  role: string = 'all',
  country: string = 'all',
  sortBy: 'trending' | 'name' | 'age' = 'trending'
): DetailedCelebrity[] {{
  let results = [...ALL_CELEBRITIES];

  if (query.trim()) {{
    const q = query.toLowerCase();
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.birthPlace.toLowerCase().includes(q) ||
        c.topTitles.some((t) => t.toLowerCase().includes(q))
    );
  }}

  if (role !== 'all') {{
    results = results.filter((c) => c.role.toLowerCase() === role.toLowerCase());
  }}

  if (country !== 'all') {{
    results = results.filter((c) => c.originCountry.toUpperCase() === country.toUpperCase());
  }}

  if (sortBy === 'name') {{
    results.sort((a, b) => a.name.localeCompare(b.name));
  }} else if (sortBy === 'age') {{
    results.sort((a, b) => (b.age || 0) - (a.age || 0));
  }} else {{
    results.sort((a, b) => a.trendingRank - b.trendingRank);
  }}

  return results;
}}
"""

with open("src/lib/data/celebrities.ts", "w", encoding="utf-8") as f:
    f.write(file_content)

print(f"Generated src/lib/data/celebrities.ts with {len(CELEBRITIES)} top stars and helper functions!")

