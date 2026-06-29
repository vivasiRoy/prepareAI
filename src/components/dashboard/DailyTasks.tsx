'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle2, Circle, PlayCircle, Clock, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Task {
  id: string
  eventId: string
  eventTitle: string
  lessonTitle: string
  type: string
  duration: number
  difficulty: number
  completed: boolean
}

interface DailyTasksProps {
  tasks: Task[]
}

export function DailyTasks({ tasks }: DailyTasksProps) {
  const [localCompleted, setLocalCompleted] = useState<Set<string>>(
    new Set(tasks.filter(t => t.completed).map(t => t.id))
  )

  const remaining = tasks.filter(t => !localCompleted.has(t.id))
  const done = tasks.filter(t => localCompleted.has(t.id))
  const totalMinutes = remaining.reduce((s, t) => s + t.duration, 0)

  if (tasks.length === 0) return (
    <div className="text-center py-8 text-gray-500 text-sm">No tasks for today. Create an event to get started.</div>
  )

  return (
    <div className="space-y-3">
      {totalMinutes > 0 && (
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> ~{totalMinutes} min remaining today
        </p>
      )}

      <AnimatePresence>
        {remaining.map(task => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3.5 rounded-xl border border-white/10 bg-white/3 hover:border-purple-500/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                <PlayCircle className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{task.lessonTitle}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">{task.eventTitle}</span>
                  <Badge variant="outline" className="text-xs py-0">{task.type.replace('_', ' ')}</Badge>
                </div>
              </div>
              <Link href={`/events/${task.eventId}/learn`}>
                <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  Start <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {done.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-xs text-gray-500 font-medium">COMPLETED ({done.length})</p>
          {done.map(task => (
            <div key={task.id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-green-500/10 bg-green-500/3 opacity-60">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              <p className="text-sm text-gray-400 line-through">{task.lessonTitle}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
