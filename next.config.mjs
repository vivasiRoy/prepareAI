/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.cloudfront.net' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [
      '@prisma/client',
      'bcryptjs',
      'ws',
      'bufferutil',
      'utf-8-validate',
      '@neondatabase/serverless',
      '@prisma/adapter-neon',
    ],
  },
}

export default nextConfig
