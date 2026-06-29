'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, Calendar, CreditCard, Settings, Zap, Menu, X, LogOut } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/events', label: 'My Events', icon: Calendar },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            PrepareAI
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href}>
              <div className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              )}>
                <Icon className="w-4 h-4" />
                {label}
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image || ''} />
            <AvatarFallback className="bg-purple-600 text-white text-xs">
              {session?.user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{session?.user?.name || 'User'}</p>
            <Badge variant="purple" className="text-xs mt-0.5">{session?.user?.plan || 'FREE'}</Badge>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="text-gray-500 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-navy-900 border-r border-white/10">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-navy-900 border border-white/10"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setMobileOpen(false)} />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-navy-900 border-r border-white/10 z-50"
          >
            <SidebarContent />
          </motion.aside>
        </>
      )}
    </>
  )
}
