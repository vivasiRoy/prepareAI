'use client'
import { useEffect } from 'react'
import { SessionProvider } from 'next-auth/react'
import { LanguageProvider } from '@/components/shared/LanguageProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  // Register the service worker so the app is installable (home-screen icon)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  return (
    <SessionProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </SessionProvider>
  )
}
