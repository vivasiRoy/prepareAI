'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FlashCardDeck } from '@/components/learning/FlashCard'
import { QuizMode } from '@/components/learning/QuizMode'
import { AIChatSidebar } from '@/components/learning/AIChatSidebar'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { LessonWithQuizzes, FlashCard, GeneratedQuiz } from '@/types'

export default function LearnPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string
  const [lesson, setLesson] = useState<LessonWithQuizzes | null>(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    fetch(`/api/events/${eventId}/curriculum`)
      .then(r => r.json())
      .then(data => {
        const lessons = data.data?.lessons || []
        const nextLesson = lessons.find((l: any) => !l.completed)
        setLesson(nextLesson || null)
        setLoading(false)
      })
  }, [eventId])

  const handleComplete = async () => {
    if (!lesson) return
    await fetch(`/api/lessons/${lesson.id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeSpent: 0, confidence: 4 }),
    })
    setCompleted(true)
    setTimeout(() => router.push(`/events/${eventId}`), 2000)
  }

  const handleQuizAnswer = async (quizId: string, response: string, timeSpent: number) => {
    const res = await fetch(`/api/quiz/${quizId}/attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response, timeSpent }),
    })
    return res.json().then(d => d.data)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
    </div>
  )

  if (!lesson) return (
    <div className="text-center py-24">
      <h2 className="text-2xl font-bold text-white mb-3">All caught up!</h2>
      <p className="text-gray-400 mb-6">No more lessons for today. Come back tomorrow!</p>
      <Link href={`/events/${eventId}`}><Button variant="gradient">Back to Event</Button></Link>
    </div>
  )

  if (completed) return (
    <div className="text-center py-24">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold text-white mb-2">Lesson Complete!</h2>
      <p className="text-gray-400">Great work. Redirecting...</p>
    </div>
  )

  const content = lesson.content as any
  const flashcards: FlashCard[] = content?.flashcards || []
  const quizzes = lesson.quizzes.map(q => ({ ...q, id: q.id, options: (q.options as string[]) || [], tags: q.tags || [] }))

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/events/${eventId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button></Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{lesson.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="purple">{lesson.type.replace('_', ' ')}</Badge>
            <span className="text-xs text-gray-500">{lesson.duration} min • Day {lesson.dayNumber}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {lesson.type === 'FLASHCARD' && flashcards.length > 0 ? (
        <FlashCardDeck
          cards={flashcards}
          onComplete={async () => { await handleComplete() }}
        />
      ) : lesson.type === 'QUIZ' && quizzes.length > 0 ? (
        <QuizMode
          quizzes={quizzes as any}
          onSubmitAnswer={handleQuizAnswer}
          onComplete={async () => { await handleComplete() }}
        />
      ) : (
        <div className="space-y-6">
          {content?.summary && (
            <div className="p-6 rounded-xl bg-navy-800 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Overview</h3>
              <p className="text-gray-300 leading-relaxed">{content.summary}</p>
            </div>
          )}
          {content?.keyPoints?.length > 0 && (
            <div className="p-6 rounded-xl bg-navy-800 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Key Points</h3>
              <ul className="space-y-3">
                {content.keyPoints.map((point: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="gradient" onClick={handleComplete}>Mark Complete ✓</Button>
          </div>
        </div>
      )}

      {/* AI Chat */}
      <AIChatSidebar
        eventId={eventId}
        lessonId={lesson.id}
        suggestedQuestions={[
          `Explain ${lesson.title} in simple terms`,
          `What are the most important things to know about ${lesson.title}?`,
          `Give me a quick test on ${lesson.title}`,
        ]}
      />
    </div>
  )
}
