'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Calendar, CreditCard, Settings, Zap, Menu, X, LogOut, ChevronRight } from 'lucide-react'
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

function SidebarContent() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-brand flex-shrink-0 group-hover:shadow-brand-lg transition-shadow">
            <Zap className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">PrepareAI</span>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/[0.06] mb-4" />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href}>
              <div className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                active
                  ? 'bg-violet-600/20 text-white border border-violet-500/20'
                  : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-200'
              )}>
                <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-violet-400' : 'text-gray-500 group-hover:text-gray-300')} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 text-violet-400/60" />}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 mx-2 mb-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 ring-1 ring-violet-500/30">
            <AvatarImage src={session?.user?.image || ''} />
            <AvatarFallback className="bg-violet-600/30 text-violet-300 text-xs font-semibold">
              {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate leading-none mb-1">{session?.user?.name || 'User'}</p>
            <Badge variant="purple" className="text-[10px] px-1.5 py-0">{(session?.user as any)?.plan || 'FREE'}</Badge>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-gray-600 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/[0.06]"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen border-r border-white/[0.06] bg-surface-1 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-surface-2 border border-white/10 text-gray-300"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay + drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-surface-1 border-r border-white/[0.06] z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
