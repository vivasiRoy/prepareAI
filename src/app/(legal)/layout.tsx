import Link from 'next/link'
import { Zap, ArrowLeft } from 'lucide-react'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-0">
      <header className="border-b border-white/[0.06] bg-surface-0/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center shadow-brand">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">PrepareAI</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-16">
        {children}
      </main>
      <footer className="border-t border-white/[0.06] py-8 px-6 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} PrepareAI. Sole Trader — England &amp; Wales.
        <span className="mx-2">·</span>
        <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
        <span className="mx-2">·</span>
        <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
      </footer>
    </div>
  )
}
