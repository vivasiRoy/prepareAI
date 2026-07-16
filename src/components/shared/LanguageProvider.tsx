'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Globe } from 'lucide-react'
import { LANGUAGES, getDictionary, type LanguageCode } from '@/lib/i18n'

interface LanguageContextValue {
  lang: LanguageCode
  setLang: (code: LanguageCode) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
})

export function useLanguage() {
  return useContext(LanguageContext)
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>('en')
  const { status } = useSession()

  useEffect(() => {
    try {
      const stored = localStorage.getItem('prepareai.lang') as LanguageCode | null
      if (stored && LANGUAGES.some(l => l.code === stored)) setLangState(stored)
    } catch {}
  }, [])

  // Signed-in users: hydrate from their saved profile preference once
  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/users/me')
      .then(r => r.json())
      .then(res => {
        const dbLang = res.data?.language as LanguageCode | undefined
        if (dbLang && LANGUAGES.some(l => l.code === dbLang)) {
          setLangState(dbLang)
          try { localStorage.setItem('prepareai.lang', dbLang) } catch {}
        }
      })
      .catch(() => {})
  }, [status])

  const setLang = useCallback((code: LanguageCode) => {
    setLangState(code)
    try { localStorage.setItem('prepareai.lang', code) } catch {}
    document.documentElement.lang = code
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
    // Persist to the profile so AI content generation uses it too
    fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: code }),
    }).catch(() => {})
  }, [])

  const t = useCallback((key: string) => getDictionary(lang)[key] || getDictionary('en')[key] || key, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        {!compact && <span>{current.flag}</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-44 py-1 rounded-xl bg-[#12121c] border border-white/10 shadow-2xl">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                  l.code === lang ? 'text-violet-300 bg-violet-500/10' : 'text-gray-300 hover:bg-white/[0.05]'
                }`}
              >
                <span>{l.flag}</span> {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
