'use client'
import { motion } from 'framer-motion'
import { TrendingUp, Flame, BookOpen, Target } from 'lucide-react'

interface StatsOverviewProps {
  totalEvents: number
  avgSuccessScore: number
  currentStreak: number
  weeklyLessons: number
}

const statConfigs = [
  {
    key: 'events',
    label: 'Active Events',
    icon: Target,
    color: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    border: 'hover:border-violet-500/25',
    glow: 'hover:shadow-[0_0_30px_-6px_rgba(139,92,246,0.3)]',
  },
  {
    key: 'score',
    label: 'Avg Success',
    icon: TrendingUp,
    color: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    border: 'hover:border-emerald-500/25',
    glow: 'hover:shadow-[0_0_30px_-6px_rgba(16,185,129,0.25)]',
  },
  {
    key: 'streak',
    label: 'Day Streak',
    icon: Flame,
    color: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    border: 'hover:border-amber-500/25',
    glow: 'hover:shadow-[0_0_30px_-6px_rgba(245,158,11,0.25)]',
  },
  {
    key: 'lessons',
    label: 'Lessons / Week',
    icon: BookOpen,
    color: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    border: 'hover:border-cyan-500/25',
    glow: 'hover:shadow-[0_0_30px_-6px_rgba(6,182,212,0.25)]',
  },
]

export function StatsOverview({ totalEvents, avgSuccessScore, currentStreak, weeklyLessons }: StatsOverviewProps) {
  const values = [totalEvents, `${Math.round(avgSuccessScore)}%`, currentStreak, weeklyLessons]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfigs.map((cfg, i) => (
        <motion.div
          key={cfg.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
        >
          <div
            className={`
              p-5 rounded-xl border border-white/[0.06] bg-white/[0.03]
              transition-all duration-300 cursor-default
              ${cfg.border} ${cfg.glow}
            `}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${cfg.iconBg}`}>
                <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-0.5">{values[i]}</p>
            <p className="text-xs text-gray-500">{cfg.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
