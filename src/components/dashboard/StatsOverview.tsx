'use client'
import { motion } from 'framer-motion'
import { TrendingUp, Flame, BookOpen, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatsOverviewProps {
  totalEvents: number
  avgSuccessScore: number
  currentStreak: number
  weeklyLessons: number
}

export function StatsOverview({ totalEvents, avgSuccessScore, currentStreak, weeklyLessons }: StatsOverviewProps) {
  const stats = [
    { label: 'Active Events', value: totalEvents, icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Avg Success Score', value: `${Math.round(avgSuccessScore)}%`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Day Streak', value: currentStreak, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Lessons This Week', value: weeklyLessons, icon: BookOpen, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <Card className="bg-navy-800 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
