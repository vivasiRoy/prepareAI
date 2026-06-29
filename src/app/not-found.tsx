'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center px-4">
        <div className="text-[10rem] font-bold bg-gradient-to-r from-purple-600/30 to-cyan-600/30 bg-clip-text text-transparent leading-none mb-8 select-none">404</div>
        <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-gray-400 mb-8 max-w-md">Looks like you wandered off the preparation path. Let's get you back on track.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard"><Button variant="gradient"><Home className="w-4 h-4 mr-2" /> Dashboard</Button></Link>
          <Button variant="outline" className="border-white/20" onClick={() => history.back()}><ArrowLeft className="w-4 h-4 mr-2" /> Go Back</Button>
        </div>
      </motion.div>
    </div>
  )
}
