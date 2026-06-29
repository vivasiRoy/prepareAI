'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles, TrendingUp, Users, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

const eventTypes = ['Job Interview', 'Bar Exam', 'Sales Pitch', 'Negotiation', 'Certification', 'Presentation']

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-navy-900 to-navy-900" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Powered by Claude AI
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
        >
          <span className="text-white">Prepare for Anything.</span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Succeed at Everything.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-gray-400 max-w-3xl mx-auto mb-10"
        >
          PrepareAI builds your personalized preparation curriculum, adapts to your learning style,
          and tracks your success probability — from day one to event day.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Link href="/signin">
            <Button variant="gradient" size="xl" className="group">
              Start Preparing Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="#demo">
            <Button variant="outline" size="xl" className="border-white/20 hover:bg-white/5">
              See How It Works
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-8 text-sm text-gray-500 mb-16"
        >
          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-purple-400" /><span><strong className="text-white">10,000+</strong> Professionals</span></div>
          <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" /><span><strong className="text-white">94%</strong> Success Rate</span></div>
          <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /><span><strong className="text-white">50+</strong> Event Types</span></div>
        </motion.div>

        {/* Floating event type pills */}
        <div className="flex flex-wrap justify-center gap-3">
          {eventTypes.map((type, i) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:border-purple-500/30 transition-all cursor-default"
            >
              {type}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
