'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, BookOpen, ArrowRight, Pause, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { SuccessMeter } from '@/components/shared/SuccessMeter'
import { formatDate, calculateDaysUntil, getEventTypeLabel } from '@/lib/utils'
import type { EventWithRelations } from '@/types'

interface EventCardProps {
  event: EventWithRelations
}

export function EventCard({ event }: EventCardProps) {
  const curriculum = event.curriculum
  const totalLessons = curriculum?.lessons?.length || 0
  const completedLessons = curriculum?.lessons?.filter(l => l.completed).length || 0
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
  const daysUntil = calculateDaysUntil(event.targetDate)
  const successScore = event.successScore || 0

  const statusConfig = {
    ACTIVE: { variant: 'success' as const, label: 'Active' },
    PAUSED: { variant: 'warning' as const, label: 'Paused' },
    COMPLETED: { variant: 'secondary' as const, label: 'Done' },
    ARCHIVED: { variant: 'outline' as const, label: 'Archived' },
  }
  const status = statusConfig[event.status] || statusConfig.ACTIVE

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="bg-navy-800 border-white/10 hover:border-purple-500/30 transition-all">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="purple" className="text-xs">{getEventTypeLabel(event.type)}</Badge>
                <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
              </div>
              <h3 className="text-lg font-semibold text-white truncate mt-2">{event.title}</h3>
            </div>
            <SuccessMeter score={successScore} size="sm" showLabel={false} className="ml-4" />
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(event.targetDate)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {daysUntil === 0 ? (
                <><CheckCircle className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Today!</span></>
              ) : daysUntil <= 3 ? (
                <><Pause className="w-3.5 h-3.5 text-red-400" /><span className="text-red-400">{daysUntil}d left</span></>
              ) : (
                <span>{daysUntil} days left</span>
              )}
            </div>
          </div>

          {curriculum && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> Progress</span>
                <span>{completedLessons}/{totalLessons} lessons</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Link href={`/events/${event.id}/learn`} className="flex-1">
              <Button variant="gradient" size="sm" className="w-full">
                Continue <ArrowRight className="ml-1 w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link href={`/events/${event.id}`}>
              <Button variant="outline" size="sm" className="border-white/20">View</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
