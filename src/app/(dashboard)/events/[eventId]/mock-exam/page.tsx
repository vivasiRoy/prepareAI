'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, CheckCircle, XCircle, Loader2,
  Clock, Target, BarChart3, AlertTriangle, Trophy, Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'

interface Question {
  id: string
  type: 'MCQ' | 'OPEN'
  topic: string
  difficulty: number
  question: string
  options?: string[]
  correctAnswer?: string
  explanation?: string
  sampleAnswer?: string
  evaluationCriteria?: string[]
}

interface QuestionResult {
  questionId: string
  score: number
  isCorrect: boolean
  feedback: string
  improvement: string
}

interface Evaluation {
  results: QuestionResult[]
  overallScore: number
  strongTopics: string[]
  weakTopics: string[]
  recommendation: string
  readinessLevel: 'READY' | 'ALMOST_READY' | 'NEEDS_WORK' | 'CRITICAL'
}

type Phase = 'setup' | 'generating' | 'taking' | 'evaluating' | 'results'

const READINESS_CONFIG = {
  READY:        { color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20',  label: 'Ready to ace it!',      icon: '🏆' },
  ALMOST_READY: { color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20',   label: 'Almost there!',         icon: '⚡' },
  NEEDS_WORK:   { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Keep grinding.',         icon: '📚' },
  CRITICAL:     { color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20',    label: 'Focus time — urgently.', icon: '🚨' },
}

export default function MockExamPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [phase, setPhase] = useState<Phase>('setup')
  const [examData, setExamData] = useState<{ questions: Question[]; daysUntil: number; mode: string; eventTitle: string } | null>(null)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [draftAnswer, setDraftAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [error, setError] = useState('')
  const [examCount, setExamCount] = useState(15)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (phase === 'taking') {
      interval = setInterval(() => setElapsedSeconds(s => s + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [phase])

  const generate = useCallback(async () => {
    setPhase('generating')
    setError('')
    try {
      const res = await fetch(`/api/events/${eventId}/mock-exam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'generate', count: examCount }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Generation failed')
      setExamData(data.data)
      setAnswers(new Array(data.data.questions.length).fill(''))
      setCurrent(0)
      setElapsedSeconds(0)
      setPhase('taking')
    } catch (e: any) {
      setError(e.message || 'Failed to generate exam')
      setPhase('setup')
    }
  }, [eventId, examCount])

  const submitAnswer = () => {
    if (!examData) return
    const newAnswers = [...answers]
    newAnswers[current] = draftAnswer
    setAnswers(newAnswers)
    setDraftAnswer('')
    if (current < examData.questions.length - 1) {
      setCurrent(c => c + 1)
    } else {
      evaluate(newAnswers)
    }
  }

  const evaluate = async (finalAnswers: string[]) => {
    if (!examData) return
    setPhase('evaluating')
    try {
      const res = await fetch(`/api/events/${eventId}/mock-exam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'evaluate', questions: examData.questions, answers: finalAnswers }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Evaluation failed')
      setEvaluation(data.data)
      setPhase('results')
    } catch (e: any) {
      setError(e.message || 'Evaluation failed')
      setPhase('taking')
    }
  }

  const q = examData?.questions[current]
  const progress = examData ? ((current + 1) / examData.questions.length) * 100 : 0
  const daysUntil = examData?.daysUntil ?? 0

  const urgencyBadge = daysUntil <= 3
    ? { label: `${daysUntil}d left — FINAL SPRINT`, color: 'bg-red-500/20 text-red-400 border-red-500/40' }
    : daysUntil <= 7
    ? { label: `${daysUntil} days left — Urgent`, color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' }
    : daysUntil <= 14
    ? { label: `${daysUntil} days left — Focused`, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' }
    : { label: `${daysUntil} days to go`, color: 'bg-purple-500/20 text-purple-400 border-purple-500/40' }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  // ── SETUP ──
  if (phase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href={`/events/${eventId}`}>
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">Mock Exam</h1>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <Card className="bg-navy-800 border-white/10">
          <CardContent className="p-8 space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-xl font-bold text-white mb-2">AI-Powered Mock Exam</h2>
              <p className="text-gray-400">
                Questions are generated from your curriculum and adapted based on your performance history and days remaining.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <Target className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                <p className="text-white font-semibold">Adaptive</p>
                <p className="text-xs text-gray-500">Based on your weak areas</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <BarChart3 className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                <p className="text-white font-semibold">Scored</p>
                <p className="text-xs text-gray-500">AI evaluates every answer</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                <p className="text-white font-semibold">Urgent-aware</p>
                <p className="text-xs text-gray-500">Harder as date approaches</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-400 font-medium">Number of questions</p>
              <div className="flex gap-3">
                {[10, 15, 20].map(n => (
                  <button
                    key={n}
                    onClick={() => setExamCount(n)}
                    className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all ${
                      examCount === n
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {n} questions
                    <span className="block text-xs opacity-70 mt-0.5">
                      {n === 10 ? '~10 min' : n === 15 ? '~15 min' : '~25 min'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Button variant="gradient" className="w-full py-6 text-base" onClick={generate}>
              <Zap className="w-5 h-5 mr-2" /> Generate My Mock Exam
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── GENERATING ──
  if (phase === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Building Your Exam...</h2>
          <p className="text-gray-400">Claude is generating {examCount} questions tailored to your prep</p>
        </div>
      </div>
    )
  }

  // ── EVALUATING ──
  if (phase === 'evaluating') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Evaluating Your Answers...</h2>
          <p className="text-gray-400">Claude is grading every response and building feedback</p>
        </div>
      </div>
    )
  }

  // ── TAKING EXAM ──
  if (phase === 'taking' && q && examData) {
    const isLast = current === examData.questions.length - 1
    const isMCQ = q.type === 'MCQ'

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Question {current + 1} of {examData.questions.length}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${urgencyBadge.color}`}>{urgencyBadge.label}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            {formatTime(elapsedSeconds)}
          </div>
        </div>

        <Progress value={progress} className="h-1.5" />

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-navy-800 border-white/10">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <Badge variant="purple" className="text-xs">{q.topic}</Badge>
                  <span className="text-xs text-gray-500">Difficulty {q.difficulty}/5</span>
                  <span className="text-xs text-gray-500 ml-auto">{isMCQ ? 'Multiple Choice' : 'Short Answer'}</span>
                </div>

                <h3 className="text-lg font-medium text-white leading-relaxed">{q.question}</h3>

                {isMCQ && q.options ? (
                  <div className="space-y-3">
                    {q.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setDraftAnswer(opt)}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          draftAnswer === opt
                            ? 'bg-purple-500/20 border-purple-500/50 text-white'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={draftAnswer}
                    onChange={e => setDraftAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={5}
                    className="w-full p-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-purple-500/50"
                  />
                )}

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => { setDraftAnswer(''); submitAnswer() }}
                    className="text-sm text-gray-500 hover:text-gray-300"
                  >
                    Skip question
                  </button>
                  <Button
                    variant="gradient"
                    onClick={submitAnswer}
                    disabled={!draftAnswer.trim()}
                  >
                    {isLast ? 'Submit Exam' : 'Next'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Question navigator */}
        <div className="flex flex-wrap gap-2">
          {examData.questions.map((_, i) => (
            <div
              key={i}
              className={`w-7 h-7 rounded text-xs flex items-center justify-center font-medium ${
                i === current
                  ? 'bg-purple-500 text-white'
                  : answers[i]
                  ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                  : 'bg-white/5 text-gray-500 border border-white/10'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── RESULTS ──
  if (phase === 'results' && evaluation && examData) {
    const rc = READINESS_CONFIG[evaluation.readinessLevel] || READINESS_CONFIG.NEEDS_WORK
    const total = examData.questions.length
    const correct = evaluation.results.filter(r => r.isCorrect).length

    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href={`/events/${eventId}`}>
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Event</Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">Exam Results</h1>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${urgencyBadge.color}`}>{urgencyBadge.label}</span>
        </div>

        {/* Score card */}
        <Card className={`${rc.bg} border ${rc.border}`}>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-3">{rc.icon}</div>
            <div className="text-6xl font-bold text-white mb-2">{evaluation.overallScore}%</div>
            <p className={`text-lg font-semibold ${rc.color} mb-1`}>{rc.label}</p>
            <p className="text-gray-400 text-sm">{correct}/{total} correct • {formatTime(elapsedSeconds)}</p>
          </CardContent>
        </Card>

        {/* Recommendation */}
        <Card className="bg-navy-800 border-white/10">
          <CardContent className="p-6">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" /> AI Recommendation
            </h3>
            <p className="text-gray-300 leading-relaxed">{evaluation.recommendation}</p>
          </CardContent>
        </Card>

        {/* Strong / Weak */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-green-500/5 border border-green-500/20">
            <CardContent className="p-5">
              <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Strong Areas
              </h4>
              {evaluation.strongTopics.length > 0 ? (
                <ul className="space-y-1">
                  {evaluation.strongTopics.map((t, i) => (
                    <li key={i} className="text-sm text-gray-300">• {t}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Keep studying!</p>
              )}
            </CardContent>
          </Card>
          <Card className="bg-red-500/5 border border-red-500/20">
            <CardContent className="p-5">
              <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Focus On
              </h4>
              {evaluation.weakTopics.length > 0 ? (
                <ul className="space-y-1">
                  {evaluation.weakTopics.map((t, i) => (
                    <li key={i} className="text-sm text-gray-300">• {t}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Excellent!</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Per-question breakdown */}
        <div>
          <h3 className="font-semibold text-white mb-4">Question Breakdown</h3>
          <div className="space-y-3">
            {examData.questions.map((q, i) => {
              const r = evaluation.results.find(r => r.questionId === q.id) || evaluation.results[i]
              if (!r) return null
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-lg border ${r.isCorrect ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {r.isCorrect
                        ? <CheckCircle className="w-5 h-5 text-green-400" />
                        : <XCircle className="w-5 h-5 text-red-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">Q{i + 1}</span>
                        <Badge variant="outline" className="text-xs border-white/10 text-gray-400">{q.topic}</Badge>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{q.question}</p>
                      <p className={`text-sm ${r.isCorrect ? 'text-green-300' : 'text-gray-400'}`}>{r.feedback}</p>
                      {!r.isCorrect && r.improvement && (
                        <p className="text-xs text-yellow-400 mt-1">💡 {r.improvement}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={`text-lg font-bold ${r.score >= 0.7 ? 'text-green-400' : r.score >= 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {Math.round(r.score * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <Button variant="gradient" onClick={generate} className="flex-1">
            <Zap className="w-4 h-4 mr-2" /> Retake Exam
          </Button>
          <Link href={`/events/${eventId}/learn`} className="flex-1">
            <Button variant="outline" className="w-full border-white/20">
              Continue Learning
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return null
}
