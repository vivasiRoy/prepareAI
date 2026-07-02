'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles, TrendingUp, Users, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

const eventTypes = ['Job Interview', 'Bar Exam', 'Sales Pitch', 'Negotiation', 'Certification', 'Presentation']

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-hero">
      {/* Floating orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-breathe absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-violet-600/[0.12] blur-[120px]" />
        <div className="animate-breathe absolute top-1/3 -right-60 w-[600px] h-[600px] rounded-full bg-cyan-500/[0.08] blur-[100px]" style={{ animationDelay: '2s' }} />
        <div className="animate-breathe absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-violet-500/[0.06] blur-[100px]" style={{ animationDelay: '4s' }} />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/25 text-violet-300 text-sm font-medium mb-8 glow-sm-purple">
            <Sparkles className="w-4 h-4" />
            Powered by Claude AI
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.05]"
        >
          <span className="text-white">Prepare for</span>
          <br />
          <span className="text-white">Anything.</span>{' '}
          <span className="gradient-text">Win</span>
          <br />
          <span className="gradient-text">Everything.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          AI builds your personalized preparation plan, adapts to how you learn,
          and tracks your readiness — from day one to event day.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
        >
          <Link href="/signin">
            <Button variant="gradient" size="xl" className="group min-w-[200px]">
              Start Preparing Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="#demo">
            <Button variant="outline" size="xl" className="min-w-[180px]">
              See How It Works
            </Button>
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6 sm:gap-10 text-sm text-gray-500 mb-14"
        >
          {[
            { icon: Users, color: 'text-violet-400', stat: '10,000+', label: 'Professionals' },
            { icon: TrendingUp, color: 'text-emerald-400', stat: '94%', label: 'Success Rate' },
            { icon: Star, color: 'text-amber-400', stat: '50+', label: 'Event Types' },
          ].map(({ icon: Icon, color, stat, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span><strong className="text-white">{stat}</strong> {label}</span>
            </div>
          ))}
        </motion.div>

        {/* Floating event type pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-2.5"
        >
          {eventTypes.map((type, i) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.7 + i * 0.08 }}
              className="px-4 py-2 rounded-full glass border border-white/[0.08] text-sm text-gray-300 hover:border-violet-500/30 hover:text-white transition-all cursor-default"
            >
              {type}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
