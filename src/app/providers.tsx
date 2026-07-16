'use client'
import { SessionProvider } from 'next-auth/react'
import { LanguageProvider } from '@/components/shared/LanguageProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </SessionProvider>
  )
}
