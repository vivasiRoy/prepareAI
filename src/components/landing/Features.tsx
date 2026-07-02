'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Brain, Clock, Target, MessageSquare, FlaskConical, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'Adaptive Curriculum',
    desc: 'AI analyzes your event and builds a day-by-day preparation plan — automatically, without any uploads needed.',
    color: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    border: 'border-violet-500/15',
    glow: 'hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.35)] hover:border-violet-500/30',
  },
  {
    icon: Clock,
    title: 'Daily Micro-Lessons',
    desc: '5–20 minute focused sessions that fit your schedule. Learn concepts, practice questions, and simulate scenarios.',
    color: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    border: 'border-cyan-500/15',
    glow: 'hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)] hover:border-cyan-500/30',
  },
  {
    icon: Target,
    title: 'Success Probability Score',
    desc: 'Real-time readiness tracker updates daily based on your accuracy, consistency, and retention — always know where you stand.',
    color: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    border: 'border-emerald-500/15',
    glow: 'hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] hover:border-emerald-500/30',
  },
  {
    icon: MessageSquare,
    title: 'AI Tutor Chat',
    desc: 'Ask anything, anytime. Your AI tutor knows your event, your weak areas, and gives personalized coaching instantly.',
    color: 'text-pink-400',
    iconBg: 'bg-pink-500/10',
    border: 'border-pink-500/15',
    glow: 'hover:shadow-[0_0_40px_-10px_rgba(236,72,153,0.3)] hover:border-pink-500/30',
  },
  {
    icon: FlaskConical,
    title: 'Mock Simulations',
    desc: 'Practice interviews, pitch to skeptical investors, argue your case, or rehearse your presentation in realistic AI environments.',
    color: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    border: 'border-amber-500/15',
    glow: 'hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)] hover:border-amber-500/30',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    desc: 'Know exactly what to focus on next. PrepareAI identifies your weak spots and automatically redirects your preparation.',
    color: 'text-sky-400',
    iconBg: 'bg-sky-500/10',
    border: 'border-sky-500/15',
    glow: 'hover:shadow-[0_0_40px_-10px_rgba(14,165,233,0.3)] hover:border-sky-500/30',
  },
]

export function Features() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="features" className="py-24 px-4" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">Features</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Everything You Need to{' '}
            <span className="gradient-text">Succeed</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            PrepareAI is your GPS for high-stakes events — giving you exactly what you need, when you need it.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.09 }}
              className={`
                p-6 rounded-xl border border-white/[0.07] bg-white/[0.025]
                backdrop-blur-sm transition-all duration-300 cursor-default
                ${f.glow}
              `}
            >
              <div className={`w-11 h-11 rounded-xl ${f.iconBg} flex items-center justify-center mb-4`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
