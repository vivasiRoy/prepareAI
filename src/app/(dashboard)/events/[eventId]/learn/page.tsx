'use client'
import { useEffect, useMemo, useState, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2, Volume2, Square, Highlighter, ExternalLink, Printer, RefreshCcw, Eraser } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { FlashCardDeck } from '@/components/learning/FlashCard'
import { QuizMode } from '@/components/learning/QuizMode'
import { AIChatSidebar } from '@/components/learning/AIChatSidebar'
import { Badge } from '@/components/ui/badge'
import { useSpeech } from '@/hooks/use-speech'
import { useLanguage } from '@/components/shared/LanguageProvider'
import type { LessonWithQuizzes, FlashCard } from '@/types'

// ─── Highlighting ────────────────────────────────────────────────────────────

/** Wrap every occurrence of the given terms in <mark>. AI terms and user
 *  highlights get different styling. */
function highlightText(text: string, aiTerms: string[], userTerms: string[]): React.ReactNode {
  if (!text) return text
  const all = [
    ...userTerms.map(t => ({ t, user: true })),
    ...aiTerms.map(t => ({ t, user: false })),
  ].filter(x => x.t && x.t.length > 2)
  if (all.length === 0) return text

  const escaped = all.map(x => x.t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const re = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = text.split(re)
  return parts.map((part, i) => {
    const hit = all.find(x => x.t.toLowerCase() === part.toLowerCase())
    if (!hit) return part
    return hit.user ? (
      <mark key={i} className="bg-amber-400/25 text-amber-100 rounded px-0.5">{part}</mark>
    ) : (
      <mark key={i} className="bg-violet-500/20 text-violet-200 rounded px-0.5 font-medium">{part}</mark>
    )
  })
}

function useUserHighlights(lessonId?: string) {
  const key = `prepareai.hl.${lessonId}`
  const [highlights, setHighlights] = useState<string[]>([])
  useEffect(() => {
    if (!lessonId) return
    try { setHighlights(JSON.parse(localStorage.getItem(key) || '[]')) } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])
  const add = (text: string) => {
    const t = text.trim()
    if (!t || t.length < 3 || t.length > 300) return
    setHighlights(prev => {
      const next = Array.from(new Set([...prev, t]))
      try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
      return next
    })
  }
  const clear = () => {
    setHighlights([])
    try { localStorage.removeItem(key) } catch {}
  }
  return { highlights, add, clear }
}

// ─── Page ────────────────────────────────────────────────────────────────────

function LearnPageInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const eventId = params.eventId as string
  const targetLessonId = searchParams.get('lesson')

  const [lesson, setLesson] = useState<LessonWithQuizzes | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [completed, setCompleted] = useState(false)

  // Understanding slider / regeneration flow
  const [rating, setRating] = useState(false)
  const [understanding, setUnderstanding] = useState(3)
  const [difficultyNote, setDifficultyNote] = useState('')
  const [regenerating, setRegenerating] = useState(false)
  const [regenError, setRegenError] = useState('')
  const [regenerated, setRegenerated] = useState(false)

  // Selection highlighting
  const { highlights, add: addHighlight, clear: clearHighlights } = useUserHighlights(lesson?.id)
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null)

  const { lang } = useLanguage()
  const tts = useSpeech(lang)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch(`/api/events/${eventId}/curriculum`)
        if (!r.ok) throw new Error(`${r.status}`)
        const data = await r.json()
        const lessons = data.data?.lessons || []
        // Open a specific lesson (from the mindmap / curriculum list) or the
        // next uncompleted one.
        const nextLesson = (targetLessonId && lessons.find((l: any) => l.id === targetLessonId))
          || lessons.find((l: any) => !l.completed)
        if (!nextLesson) { if (!cancelled) { setLesson(null); setLoading(false) } return }

        // If the lesson's type-appropriate content hasn't been generated yet,
        // fetch the lesson detail — the API generates it on demand (one AI
        // call). Flashcard lessons need cards, quiz lessons need questions.
        const c = nextLesson.content
        const needsContent =
          nextLesson.type === 'FLASHCARD' ? !(c?.flashcards?.length)
          : nextLesson.type === 'QUIZ' ? !(nextLesson.quizzes?.length)
          : !c?.summary && !(c?.keyPoints?.length)
        if (needsContent) {
          if (!cancelled) { setLoading(false); setGenerating(true) }
          const lr = await fetch(`/api/lessons/${nextLesson.id}`)
          const ld = await lr.json()
          if (!cancelled) setLesson(ld.data || nextLesson)
        } else {
          if (!cancelled) setLesson(nextLesson)
        }
      } catch {
        // fall through to loading=false below
      } finally {
        if (!cancelled) { setLoading(false); setGenerating(false) }
      }
    })()
    return () => { cancelled = true }
  }, [eventId, targetLessonId])

  // Selection → floating "Highlight" button
  useEffect(() => {
    const onSelect = () => {
      const sel = window.getSelection()
      const text = sel?.toString().trim() || ''
      if (text.length >= 3 && text.length <= 300) {
        const rect = sel!.getRangeAt(0).getBoundingClientRect()
        setSelection({ text, x: rect.left + rect.width / 2, y: rect.top })
      } else {
        setSelection(null)
      }
    }
    document.addEventListener('mouseup', onSelect)
    document.addEventListener('touchend', onSelect)
    return () => {
      document.removeEventListener('mouseup', onSelect)
      document.removeEventListener('touchend', onSelect)
    }
  }, [])

  const finishLesson = async (confidence: number) => {
    if (!lesson) return
    tts.stop()
    await fetch(`/api/lessons/${lesson.id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeSpent: 0, confidence }),
    })
    setRating(false)
    setCompleted(true)
    setTimeout(() => router.push(`/events/${eventId}`), 2000)
  }

  const regenerate = async () => {
    if (!lesson) return
    setRegenerating(true)
    setRegenError('')
    tts.stop()
    try {
      const res = await fetch(`/api/lessons/${lesson.id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ understanding, feedback: difficultyNote || undefined }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Regeneration failed')
      setLesson(data.data)
      setRating(false)
      setDifficultyNote('')
      setRegenerated(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => setRegenerated(false), 5000)
    } catch (e: any) {
      setRegenError(e.message || 'Could not regenerate. Try again.')
    } finally {
      setRegenerating(false)
    }
  }

  const handleQuizAnswer = async (quizId: string, response: string, timeSpent: number) => {
    const res = await fetch(`/api/quiz/${quizId}/attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response, timeSpent }),
    })
    return res.json().then(d => d.data)
  }

  const content = lesson?.content as any
  const aiTerms: string[] = useMemo(() => content?.keyTerms || [], [content])
  const furtherReading: { title: string; url: string }[] = content?.furtherReading || []
  const flashcards: FlashCard[] = content?.flashcards || []
  const quizzes = (lesson?.quizzes || []).map(q => ({ ...q, id: q.id, options: (q.options as string[]) || [], tags: q.tags || [] }))

  const listenText = useMemo(() => {
    if (!lesson) return ''
    const parts = [lesson.title]
    if (content?.summary) parts.push(content.summary)
    if (content?.keyPoints?.length) parts.push('Key points. ' + content.keyPoints.join('. '))
    if (content?.examples?.length) parts.push('Examples. ' + content.examples.join('. '))
    return parts.join('\n')
  }, [lesson, content])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
    </div>
  )

  if (generating) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
      <Loader2 className="w-10 h-10 animate-spin text-violet-400 mb-4" />
      <h2 className="text-xl font-semibold text-white mb-1">Preparing your lesson…</h2>
      <p className="text-gray-400 text-sm max-w-sm">The AI is writing this lesson&apos;s content just for you. This takes a few seconds.</p>
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

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* Floating highlight button on text selection */}
      <AnimatePresence>
        {selection && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ position: 'fixed', left: selection.x - 46, top: Math.max(8, selection.y - 44), zIndex: 60 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-black text-xs font-semibold shadow-lg"
            onMouseDown={e => { e.preventDefault(); addHighlight(selection.text); setSelection(null); window.getSelection()?.removeAllRanges() }}
          >
            <Highlighter className="w-3.5 h-3.5" /> Highlight
          </motion.button>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/events/${eventId}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button></Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white truncate">{lesson.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="purple">{lesson.type.replace('_', ' ')}</Badge>
            <span className="text-xs text-gray-500">{lesson.duration} min • Day {lesson.dayNumber}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {tts.supported && (
            <Button
              variant="outline"
              size="sm"
              className="border-white/15"
              onClick={() => (tts.speaking ? tts.stop() : tts.speak(listenText))}
              title={tts.speaking ? 'Stop reading' : 'Read this lesson aloud'}
            >
              {tts.speaking ? <><Square className="w-3.5 h-3.5 mr-1.5" /> Stop</> : <><Volume2 className="w-3.5 h-3.5 mr-1.5" /> Listen</>}
            </Button>
          )}
          <a href={`/print/${lesson.id}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="border-white/15" title="Print / save as PDF">
              <Printer className="w-3.5 h-3.5 mr-1.5" /> PDF
            </Button>
          </a>
        </div>
      </div>

      {regenerated && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-sm flex items-center gap-2">
          <RefreshCcw className="w-4 h-4 shrink-0" /> Rewritten with a fresh approach — take another look ✨
        </div>
      )}

      {highlights.length > 0 && (
        <div className="mb-5 flex items-center justify-between text-xs text-gray-500">
          <span><Highlighter className="w-3.5 h-3.5 inline mr-1 text-amber-400" />{highlights.length} highlight{highlights.length > 1 ? 's' : ''} on this lesson</span>
          <button onClick={clearHighlights} className="flex items-center gap-1 hover:text-white transition-colors">
            <Eraser className="w-3 h-3" /> Clear
          </button>
        </div>
      )}

      {/* Content */}
      {lesson.type === 'FLASHCARD' && flashcards.length > 0 ? (
        <FlashCardDeck
          cards={flashcards}
          onComplete={async () => { setRating(true) }}
        />
      ) : lesson.type === 'QUIZ' && quizzes.length > 0 ? (
        <QuizMode
          quizzes={quizzes as any}
          onSubmitAnswer={handleQuizAnswer}
          onComplete={async () => { setRating(true) }}
        />
      ) : (
        <div className="space-y-6">
          {content?.summary && (
            <div className="p-6 rounded-xl bg-navy-800 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Overview</h3>
              <p className="text-gray-300 leading-relaxed select-text">{highlightText(content.summary, aiTerms, highlights)}</p>
            </div>
          )}
          {content?.keyPoints?.length > 0 && (
            <div className="p-6 rounded-xl bg-navy-800 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Key Points</h3>
              <ul className="space-y-3">
                {content.keyPoints.map((point: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 select-text">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span>{highlightText(point, aiTerms, highlights)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {content?.examples?.length > 0 && (
            <div className="p-6 rounded-xl bg-navy-800 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Examples</h3>
              <ul className="space-y-3">
                {content.examples.map((ex: string, i: number) => (
                  <li key={i} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-gray-300 text-sm select-text">
                    {highlightText(ex, aiTerms, highlights)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="gradient" onClick={() => setRating(true)}>Finish Lesson ✓</Button>
          </div>
        </div>
      )}

      {/* Further reading */}
      {furtherReading.length > 0 && (
        <div className="mt-6 p-6 rounded-xl bg-cyan-500/[0.05] border border-cyan-500/20">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-cyan-400" /> Dive deeper
          </h3>
          <ul className="space-y-2">
            {furtherReading.map((r, i) => (
              <li key={i}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-300 hover:text-cyan-100 underline decoration-cyan-500/40 underline-offset-2 transition-colors">
                  {r.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Understanding rating + regenerate loop */}
      <AnimatePresence>
        {rating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="w-full max-w-md p-6 rounded-2xl bg-[#12121c] border border-white/10 shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-white mb-1">How well did you understand this?</h3>
              <p className="text-gray-500 text-sm mb-5">Be honest — this shapes what happens next.</p>

              <div className="flex justify-between text-2xl mb-2 px-1">
                {['😵', '😕', '🙂', '😀', '🤩'].map((e, i) => (
                  <button
                    key={i}
                    onClick={() => setUnderstanding(i + 1)}
                    className={`transition-transform ${understanding === i + 1 ? 'scale-125' : 'opacity-40 hover:opacity-80'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={understanding}
                onChange={e => setUnderstanding(Number(e.target.value))}
                className="w-full accent-violet-500 mb-1"
              />
              <div className="flex justify-between text-[11px] text-gray-600 mb-5">
                <span>Totally lost</span><span>Crystal clear</span>
              </div>

              {understanding <= 2 && (
                <div className="mb-5">
                  <label className="text-sm text-gray-300 mb-1.5 block">What was confusing? <span className="text-gray-600">(optional, helps the AI)</span></label>
                  <textarea
                    value={difficultyNote}
                    onChange={e => setDifficultyNote(e.target.value)}
                    placeholder="e.g. I don't get why the eigenvalues matter…"
                    className="w-full min-h-[70px] p-3 rounded-xl bg-white/[0.04] border border-white/15 text-sm text-white placeholder:text-gray-600 focus:border-violet-500/60 outline-none resize-none"
                  />
                </div>
              )}

              {regenError && <p className="text-red-400 text-sm mb-3">{regenError}</p>}

              <div className="flex flex-col gap-2">
                {understanding <= 2 ? (
                  <>
                    <Button variant="gradient" onClick={regenerate} disabled={regenerating}>
                      {regenerating
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Rewriting with a new approach…</>
                        : <><RefreshCcw className="w-4 h-4 mr-2" /> Explain it differently</>}
                    </Button>
                    <Button variant="ghost" onClick={() => finishLesson(understanding)} disabled={regenerating} className="text-gray-500">
                      Complete anyway
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="gradient" onClick={() => finishLesson(understanding)}>
                      Finish lesson 🎉
                    </Button>
                    {understanding === 3 && (
                      <Button variant="ghost" onClick={regenerate} disabled={regenerating} className="text-gray-500">
                        {regenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5 mr-2" />}
                        Actually, explain it differently first
                      </Button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>}>
      <LearnPageInner />
    </Suspense>
  )
}
