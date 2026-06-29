'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { BookOpen, Clock, ChevronRight, Star, Lightbulb, Code2, Bookmark } from 'lucide-react'
import type { LessonWithQuizzes } from '@/types'

interface LessonViewerProps {
  lesson: LessonWithQuizzes
  onComplete: () => void
}

export function LessonViewer({ lesson, onComplete }: LessonViewerProps) {
  const [readProgress, setReadProgress] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)
  const content = lesson.content as any

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const scrolled = el.scrollTop / (el.scrollHeight - el.clientHeight)
    setReadProgress(Math.min(100, Math.round(scrolled * 100)))
  }

  const keyPoints: string[] = content?.keyPoints || []
  const examples: Array<{ title: string; code?: string; explanation: string }> = content?.examples || []
  const summary: string = content?.summary || ''
  const practiceQuestions: string[] = content?.practiceQuestions || []

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <Badge variant="purple">{lesson.type.replace('_', ' ')}</Badge>
            <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {lesson.duration} min</span>
          </div>
          <h2 className="text-xl font-bold text-white">{lesson.title}</h2>
        </div>
        <button onClick={() => setBookmarked(b => !b)} className={`p-2 rounded-lg transition-colors ${bookmarked ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:text-white'}`}>
          <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      <Progress value={readProgress} className="h-1 mb-6" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2" onScroll={handleScroll}>
        {/* Summary */}
        {summary && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <p className="text-gray-200 leading-relaxed">{summary}</p>
          </motion.div>
        )}

        {/* Key Points */}
        {keyPoints.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-white mb-3">
              <Star className="w-4 h-4 text-yellow-400" /> Key Concepts
            </h3>
            <div className="space-y-2.5">
              {keyPoints.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/3 border border-white/5"
                >
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">{i + 1}</span>
                  <p className="text-gray-300 text-sm leading-relaxed">{point}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Examples */}
        {examples.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-white mb-3">
              <Code2 className="w-4 h-4 text-cyan-400" /> Examples
            </h3>
            <div className="space-y-4">
              {examples.map((ex, i) => (
                <div key={i} className="rounded-xl border border-white/10 overflow-hidden">
                  <div className="px-4 py-2.5 bg-white/5 border-b border-white/10">
                    <h4 className="text-sm font-medium text-white">{ex.title}</h4>
                  </div>
                  {ex.code && (
                    <pre className="p-4 text-xs text-green-400 bg-black/30 overflow-x-auto font-mono leading-relaxed">{ex.code}</pre>
                  )}
                  <div className="px-4 py-3">
                    <p className="text-sm text-gray-300 leading-relaxed">{ex.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practice Questions */}
        {practiceQuestions.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-white mb-3">
              <Lightbulb className="w-4 h-4 text-orange-400" /> Think About It
            </h3>
            <div className="space-y-2">
              {practiceQuestions.map((q, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                  <ChevronRight className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300">{q}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>

      <Separator className="my-4 bg-white/10" />

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{readProgress}% read</p>
        <Button variant="gradient" onClick={onComplete} disabled={readProgress < 20}>
          {readProgress < 20 ? 'Keep reading...' : 'Mark Complete ✓'}
        </Button>
      </div>
    </div>
  )
}
