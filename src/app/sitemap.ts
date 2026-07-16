import type { MetadataRoute } from 'next'
import { PREPARE_PAGES } from '@/lib/prepare-pages'

const BASE = 'https://prepareai.co'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/signin`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    ...PREPARE_PAGES.map(p => ({
      url: `${BASE}/prepare/${p.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ]
}
