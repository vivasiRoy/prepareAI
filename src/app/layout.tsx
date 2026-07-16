import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'PrepareAI — AI-Powered Preparation System',
    template: '%s | PrepareAI',
  },
  description: 'PrepareAI builds your personalized preparation curriculum, adapts to your learning, and tracks your success probability for any high-stakes event.',
  keywords: ['AI preparation', 'interview prep', 'exam prep', 'adaptive learning', 'success probability'],
  authors: [{ name: 'PrepareAI' }],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PrepareAI',
  },
  openGraph: {
    title: 'PrepareAI — Your GPS for High-Stakes Success',
    description: 'Prepare for interviews, exams, presentations, and negotiations with AI that adapts to how you learn.',
    url: 'https://prepareai.co',
    siteName: 'PrepareAI',
    locale: 'en_US',
    type: 'website',
    images: [{ url: 'https://prepareai.co/og.png', width: 1200, height: 630, alt: 'PrepareAI — Prepare for anything. Win everything.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PrepareAI',
    description: 'AI-powered preparation for any high-stakes event',
    images: ['https://prepareai.co/og.png'],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#09090f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
