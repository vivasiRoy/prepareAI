import Link from 'next/link'
import { Zap, ArrowLeft } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-hero flex flex-col overflow-hidden">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-violet-600/[0.12] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/[0.06] rounded-full blur-[100px]" />
      </div>

      <header className="relative z-10 p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <div className="flex items-center gap-2 ml-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold gradient-text">PrepareAI</span>
          </div>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        {children}
      </main>

      <footer className="relative z-10 p-6 text-center text-xs text-gray-700">
        © 2025 PrepareAI. All rights reserved.
      </footer>
    </div>
  )
}
