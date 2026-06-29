import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import Link from 'next/link'
import { LayoutDashboard, Users, BarChart3, Cpu, DollarSign, Zap, ArrowLeft } from 'lucide-react'

const adminNav = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/llm-usage', label: 'LLM Usage', icon: Cpu },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin()
  } catch {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      <aside className="w-56 min-h-screen bg-red-950/20 border-r border-red-900/30 flex flex-col">
        <div className="p-5 border-b border-red-900/30">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded bg-red-600 flex items-center justify-center"><Zap className="w-3.5 h-3.5 text-white" /></div>
            <span className="font-bold text-white text-sm">PrepareAI</span>
          </div>
          <span className="text-xs font-bold text-red-400 tracking-wider">ADMIN PANEL</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {adminNav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-red-900/30">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Exit Admin
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
