import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/login/'],
      },
    ],
    sitemap: 'https://minpaku-checker.aosalonai.com/sitemap.xml',
  };
}
