'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, BookOpen, ArrowRight, AlertTriangle, CheckCircle, Zap, Clock } from 'lucide-react'
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

  const statusBadge = {
    ACTIVE:   { variant: 'success' as const, label: 'Active' },
    PAUSED:   { variant: 'warning' as const, label: 'Paused' },
    COMPLETED:{ variant: 'secondary' as const, label: 'Done' },
    ARCHIVED: { variant: 'outline' as const, label: 'Archived' },
  }[event.status] || { variant: 'success' as const, label: 'Active' }

  const urgency = daysUntil <= 3 ? 'critical' : daysUntil <= 7 ? 'high' : daysUntil <= 14 ? 'medium' : 'normal'

  const cardBorder = urgency === 'critical'
    ? 'border-red-500/30 hover:border-red-500/50'
    : urgency === 'high'
    ? 'border-amber-500/20 hover:border-amber-500/40'
    : 'border-white/[0.07] hover:border-violet-500/25'

  const cardGlow = urgency === 'critical'
    ? 'hover:shadow-[0_0_30px_-6px_rgba(239,68,68,0.3)]'
    : urgency === 'high'
    ? 'hover:shadow-[0_0_30px_-6px_rgba(245,158,11,0.2)]'
    : 'hover:shadow-[0_0_30px_-6px_rgba(124,58,237,0.2)]'

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className={`rounded-xl border bg-white/[0.03] p-5 transition-all duration-300 ${cardBorder} ${cardGlow}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="purple" className="text-[10px]">{getEventTypeLabel(event.type)}</Badge>
              <Badge variant={statusBadge.variant} className="text-[10px]">{statusBadge.label}</Badge>
            </div>
            <h3 className="text-base font-semibold text-white truncate">{event.title}</h3>
          </div>
          <SuccessMeter score={successScore} size="sm" showLabel={false} />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(event.targetDate)}
          </span>
          <span className="flex items-center gap-1.5">
            {daysUntil === 0 ? (
              <><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400 font-medium">Today!</span></>
            ) : daysUntil < 0 ? (
              <><Clock className="w-3.5 h-3.5 text-gray-500" /><span>Passed</span></>
            ) : daysUntil <= 3 ? (
              <><AlertTriangle className="w-3.5 h-3.5 text-red-400" /><span className="text-red-400 font-medium">{daysUntil}d left!</span></>
            ) : daysUntil <= 7 ? (
              <><Clock className="w-3.5 h-3.5 text-amber-400" /><span className="text-amber-400">{daysUntil}d left</span></>
            ) : (
              <><Clock className="w-3.5 h-3.5" /><span>{daysUntil} days</span></>
            )}
          </span>
        </div>

        {/* Progress */}
        {curriculum && totalLessons > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-[11px] text-gray-600 mb-1.5">
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> Curriculum</span>
              <span>{completedLessons}/{totalLessons}</span>
            </div>
            <Progress value={progress} className="h-1 bg-white/[0.05]" />
          </div>
        )}

        {/* Urgency mock exam CTA */}
        {daysUntil <= 7 && daysUntil > 0 && (
          <Link href={`/events/${event.id}/mock-exam`} className="block mb-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              urgency === 'critical'
                ? 'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25'
                : 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
            }`}>
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>Mock Exam — {daysUntil}d left{urgency === 'critical' ? '!' : ''}</span>
              <ArrowRight className="w-3 h-3 ml-auto" />
            </div>
          </Link>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/events/${event.id}/learn`} className="flex-1">
            <Button variant="gradient" size="sm" className="w-full">
              Continue <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link href={`/events/${event.id}`}>
            <Button variant="outline" size="sm">View</Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
