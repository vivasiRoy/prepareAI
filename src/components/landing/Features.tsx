'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Brain, Clock, Target, MessageSquare, FlaskConical, BarChart3 } from 'lucide-react'

const features = [
  { icon: Brain, title: 'Adaptive Curriculum', desc: 'AI analyzes your event and builds a day-by-day preparation plan — automatically, without any uploads needed.', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { icon: Clock, title: 'Daily Micro-Lessons', desc: '5–20 minute focused sessions that fit your schedule. Learn concepts, practice questions, and simulate scenarios.', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  { icon: Target, title: 'Success Probability Score', desc: 'Real-time readiness tracker updates daily based on your accuracy, consistency, and retention — always know where you stand.', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  { icon: MessageSquare, title: 'AI Tutor Chat', desc: 'Ask anything, anytime. Your AI tutor knows your event, your weak areas, and gives personalized coaching instantly.', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  { icon: FlaskConical, title: 'Mock Simulations', desc: 'Practice interviews, pitch to skeptical investors, argue your case, or rehearse your presentation — in realistic AI-simulated environments.', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { icon: BarChart3, title: 'Smart Analytics', desc: 'Know exactly what to focus on next. PrepareAI identifies your weak spots and automatically redirects your preparation.', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
]

export function Features() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="features" className="py-24 px-4" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Succeed</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            PrepareAI is your GPS for high-stakes events — giving you exactly what you need, when you need it.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`p-6 rounded-xl border backdrop-blur-sm ${f.bg} hover:scale-105 transition-transform cursor-default`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${f.bg}`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
