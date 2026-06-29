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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-navy-900/95 backdrop-blur-md border-b border-white/10' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              PrepareAI
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link>
            <Link href="#use-cases" className="text-sm text-gray-400 hover:text-white transition-colors">Use Cases</Link>
          </div>

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

          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-navy-900/98 backdrop-blur-md border-b border-white/10"
          >
            <div className="px-4 py-4 space-y-3">
              <Link href="#features" className="block text-gray-400 hover:text-white py-2" onClick={() => setIsOpen(false)}>Features</Link>
              <Link href="#pricing" className="block text-gray-400 hover:text-white py-2" onClick={() => setIsOpen(false)}>Pricing</Link>
              <div className="pt-2 space-y-2">
                <Link href="/signin" className="block"><Button variant="ghost" className="w-full">Sign In</Button></Link>
                <Link href="/signin" className="block"><Button variant="gradient" className="w-full">Start Free</Button></Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
