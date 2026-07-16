'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-surface-0/90 backdrop-blur-xl border-b border-white/[0.06]'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-brand">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">PrepareAI</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Features', href: '#features' },
              { label: 'How It Works', href: '#demo' },
              { label: 'Pricing', href: '#pricing' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <Link href="/dashboard">
                <Button variant="gradient" size="sm">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/signin"><Button variant="ghost" size="sm">Sign In</Button></Link>
                <Link href="/signin"><Button variant="gradient" size="sm">Start Free</Button></Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-gray-400 hover:text-white transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface-1/95 backdrop-blur-xl border-b border-white/[0.06]"
          >
            <div className="px-4 py-4 space-y-1">
              {[
                { label: 'Features', href: '#features' },
                { label: 'How It Works', href: '#demo' },
                { label: 'Pricing', href: '#pricing' },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="block text-gray-400 hover:text-white py-2.5 px-2 rounded-lg hover:bg-white/[0.04] transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <div className="pt-3 space-y-2 border-t border-white/[0.06]">
                <Link href="/signin" className="block">
                  <Button variant="ghost" className="w-full">Sign In</Button>
                </Link>
                <Link href="/signin" className="block">
                  <Button variant="gradient" className="w-full">Start Free</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
