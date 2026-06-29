'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'
import type { CurriculumWithLessons } from '@/types'

interface CurriculumEditorProps {
  curriculum: CurriculumWithLessons
  eventId: string
  onRegenerate: () => void
}

export function CurriculumEditor({ curriculum, eventId, onRegenerate }: CurriculumEditorProps) {
  const [regenerating, setRegenerate] = useState(false)
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1, 2, 3]))

  const lessonsByDay = curriculum.lessons.reduce((acc, lesson) => {
    if (!acc[lesson.dayNumber]) acc[lesson.dayNumber] = []
    acc[lesson.dayNumber].push(lesson)
    return acc
  }, {} as Record<number, typeof curriculum.lessons>)

  const days = Object.keys(lessonsByDay).map(Number).sort((a, b) => a - b)

  const handleRegenerate = async () => {
    setRegenerate(true)
    await fetch(`/api/events/${eventId}/curriculum`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regenerate: true }),
    })
    setRegenerate(false)
    onRegenerate()
  }

  const toggleDay = (day: number) => {
    setExpandedDays(prev => {
      const next = new Set(prev)
      if (next.has(day)) next.delete(day)
      else next.add(day)
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{curriculum.title}</h3>
          <p className="text-sm text-gray-400 mt-0.5">{curriculum.totalDays} days • {curriculum.lessons.length} lessons</p>
        </div>
        <Button variant="outline" size="sm" className="border-white/20" onClick={handleRegenerate} disabled={regenerating}>
          {regenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Regenerate
        </Button>
      </div>

      <div className="space-y-2">
        {days.map(day => {
          const lessons = lessonsByDay[day]
          const isExpanded = expandedDays.has(day)
          const allCompleted = lessons.every(l => l.completed)

          return (
            <div key={day} className={`rounded-xl border overflow-hidden ${allCompleted ? 'border-green-500/20' : 'border-white/10'}`}>
              <button
                onClick={() => toggleDay(day)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/3 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${allCompleted ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {day}
                  </div>
                  <span className="text-sm font-medium text-white">Day {day}</span>
                  <span className="text-xs text-gray-500">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}</span>
                  {allCompleted && <Badge variant="success" className="text-xs">Done</Badge>}
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="p-3 space-y-2">
                      {lessons.map(lesson => (
                        <div key={lesson.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/2">
                          <GripVertical className="w-4 h-4 text-gray-600 cursor-grab" />
                          <div className="flex-1">
                            <p className={`text-sm ${lesson.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{lesson.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-xs py-0">{lesson.type.replace('_', ' ')}</Badge>
                              <span className="text-xs text-gray-600">{lesson.duration}m • Difficulty {lesson.difficulty}/5</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
