import { MetadataRoute } from 'next';
import { getCatalog } from '@/lib/api/movieStore';
import { CELEBRITIES_BORN_TODAY } from '@/lib/data/mockMovies';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://moviestars.vercel.app';
  const catalog = getCatalog();

  // 1. Static Core Application Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/top-rated`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/upcoming`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/system-design`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // 2. Dynamic Title Routes (All Movies, TV Shows, Web Series)
  const titleRoutes: MetadataRoute.Sitemap = catalog.map((item) => ({
    url: `${baseUrl}/title/${item.id}`,
    lastModified: new Date(item.releaseDate || Date.now()),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // 3. Dynamic Celebrity Profiles
  const celebrityRoutes: MetadataRoute.Sitemap = CELEBRITIES_BORN_TODAY.map((celeb) => ({
    url: `${baseUrl}/person/${celeb.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  return [...staticRoutes, ...titleRoutes, ...celebrityRoutes];
}

