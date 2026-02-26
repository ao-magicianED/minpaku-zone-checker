import type { MetadataRoute } from 'next';
import { getAllMunicipalities, getRegisteredPrefectures } from '@/lib/municipality-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://minpaku-checker.aosalonai.com';

  // 固定ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/check`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guide`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/area`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // 都道府県ページ
  const prefectures = getRegisteredPrefectures();
  const prefecturePages: MetadataRoute.Sitemap = prefectures.map((pref) => ({
    url: `${baseUrl}/area/${encodeURIComponent(pref)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // 市区町村ページ
  const municipalities = getAllMunicipalities();
  const municipalityPages: MetadataRoute.Sitemap = municipalities.map((m) => ({
    url: `${baseUrl}/area/${encodeURIComponent(m.prefecture)}/${encodeURIComponent(m.city)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...prefecturePages, ...municipalityPages];
}
