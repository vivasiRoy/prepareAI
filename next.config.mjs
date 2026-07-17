import { execSync } from 'node:child_process'
import { PHASE_PRODUCTION_BUILD } from 'next/constants.js'

/** @type {import('next').NextConfig} */
const baseConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.cloudfront.net' },
    ],
  },
  experimental: {
    // Prisma runs as an EXTERNAL package (canonical Next.js setup): the
    // generated client + engine binaries live in node_modules and are traced
    // into the standalone output by Next, including the Linux engines from
    // binaryTargets. (Changed from the webpack-bundled --no-engine
    // Accelerate-only setup during the 2026-07-17 Prisma outage failover.)
    serverComponentsExternalPackages: [
      'bcryptjs',
      '@prisma/client',
      '@prisma/adapter-neon',
      '@neondatabase/serverless',
      'ws',
    ],
  },
  async headers() {
    return [
      {
        // API responses are per-user and must never be cached by the CDN.
        // Firebase's CDN cached a curriculum 404 (max-age=600) and served it
        // across requests — this makes no-store explicit on every API route.
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
        ],
      },
    ]
  },
}

export default function config(phase) {
  // Generate the Prisma client (with Linux engines per binaryTargets) during
  // `next build` so the standalone output traces everything it needs.
  if (phase === PHASE_PRODUCTION_BUILD && !global.__prismaGenerated) {
    global.__prismaGenerated = true
    try {
      execSync('npx prisma generate', { stdio: 'inherit' })
    } catch (e) {
      console.error('prisma generate failed during next build:', e)
    }
  }
  return baseConfig
}
