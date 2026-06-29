import Link from 'next/link'
import { Zap, ArrowLeft } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />

      <header className="relative z-10 p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">PrepareAI</span>
          </div>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        {children}
      </main>

      <footer className="relative z-10 p-6 text-center text-xs text-gray-600">
        © 2025 PrepareAI. All rights reserved.
      </footer>
    </div>
  )
}
