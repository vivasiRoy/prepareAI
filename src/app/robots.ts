import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard', '/events/', '/billing', '/settings', '/admin', '/print/'],
      },
    ],
    sitemap: 'https://prepareai.co/sitemap.xml',
  }
}
