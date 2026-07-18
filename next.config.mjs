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
    // NOTE: @prisma/client and @prisma/extension-accelerate are intentionally
    // NOT external. With `prisma generate --no-engine` the client is pure JS
    // (no native engine binary), so webpack bundles it straight into .next.
    // This is what makes it survive Firebase's fresh cloud dependency install,
    // which would otherwise leave node_modules/.prisma/client as a stub.
    serverComponentsExternalPackages: [
      'bcryptjs',
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
  // Generate a no-engine Prisma client for Accelerate during `next build`
  // (Firebase runs `next build` directly). --no-engine means no query engine
  // binary is bundled — the client talks to Accelerate over HTTP.
  if (phase === PHASE_PRODUCTION_BUILD && !global.__prismaGenerated) {
    global.__prismaGenerated = true
    try {
      execSync('npx prisma generate --no-engine', { stdio: 'inherit' })
    } catch (e) {
      console.error('prisma generate failed during next build:', e)
    }
  }
  return baseConfig
}
