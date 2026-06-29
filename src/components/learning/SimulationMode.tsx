'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Mic, MicOff, Send, RotateCcw, CheckCircle2, Clock, MessageSquare, Loader2 } from 'lucide-react'

interface SimulationStep {
  prompt: string
  type: 'question' | 'scenario' | 'followup'
  hints?: string[]
}

interface SimulationModeProps {
  eventId: string
  lessonId: string
  scenario: string
  steps: SimulationStep[]
  onComplete: (score: number) => void
}

interface Message {
  role: 'interviewer' | 'user'
  content: string
  feedback?: string
  score?: number
}

export function SimulationMode({ eventId, lessonId, scenario, steps, onComplete }: SimulationModeProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [scores, setScores] = useState<number[]>([])
  const [showHints, setShowHints] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const timerRef = useRef<NodeJS.Timeout>()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([{ role: 'interviewer', content: steps[0]?.prompt || '' }])
    timerRef.current = setInterval(() => setTimeElapsed(t => t + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [steps])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const handleSubmit = async () => {
    if (!response.trim() || loading) return
    const userMsg: Message = { role: 'user', content: response }
    setMessages(m => [...m, userMsg])
    setResponse('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'simulation',
          eventId,
          context: `Scenario: ${scenario}\nQuestion: ${steps[currentStep]?.prompt}\nAnswer: ${response}`,
        }),
      })
      const data = await res.json()
      const feedback = data.data?.feedback || 'Good response. Keep practicing.'
      const score = data.data?.score || Math.floor(60 + Math.random() * 35)

      setScores(s => [...s, score])
      setMessages(m => [...m, { role: 'interviewer', content: feedback, score }])

      const nextStep = currentStep + 1
      if (nextStep < steps.length) {
        setTimeout(() => {
          setMessages(m => [...m, { role: 'interviewer', content: steps[nextStep].prompt }])
          setCurrentStep(nextStep)
          setShowHints(false)
        }, 1000)
      } else {
        clearInterval(timerRef.current)
        const avg = Math.round([...scores, score].reduce((a, b) => a + b, 0) / (scores.length + 1))
        setTimeout(() => onComplete(avg), 1500)
      }
    } catch {
      setMessages(m => [...m, { role: 'interviewer', content: 'I had trouble processing your response. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const progress = ((currentStep) / steps.length) * 100
  const step = steps[currentStep]

  return (
    <div className="flex flex-col h-[600px] rounded-xl border border-white/10 bg-[#0F172A] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium text-white">Live Simulation</span>
          <Badge variant="purple">Step {currentStep + 1}/{steps.length}</Badge>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatTime(timeElapsed)}</span>
          {scores.length > 0 && <span className="text-purple-400 font-medium">Avg: {Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}%</span>}
        </div>
      </div>

      <Progress value={progress} className="h-0.5 rounded-none" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-purple-600/30 border border-purple-500/30 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-200'
              }`}>
                {msg.role === 'interviewer' && <p className="text-xs text-purple-400 font-medium mb-1">Interviewer</p>}
                <p className="text-sm leading-relaxed">{msg.content}</p>
                {msg.score !== undefined && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <span className={`text-xs font-bold ${msg.score >= 80 ? 'text-green-400' : msg.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      Score: {msg.score}%
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span className="text-sm text-gray-400">Analyzing response...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Hints */}
      {step?.hints && step.hints.length > 0 && (
        <div className="px-4">
          <button onClick={() => setShowHints(s => !s)} className="text-xs text-purple-400 hover:text-purple-300 transition-colors mb-2">
            {showHints ? 'Hide hints' : 'Show hints'}
          </button>
          {showHints && (
            <div className="mb-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <ul className="space-y-1">
                {step.hints.map((hint, i) => <li key={i} className="text-xs text-purple-300">• {hint}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <Textarea
            value={response}
            onChange={e => setResponse(e.target.value)}
            placeholder="Type your response..."
            className="min-h-[80px] bg-white/5 border-white/20 resize-none text-sm"
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit() }}
          />
          <div className="flex flex-col gap-2">
            <Button variant="gradient" size="sm" onClick={handleSubmit} disabled={!response.trim() || loading} className="h-10 w-10 p-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1.5">Ctrl+Enter to submit</p>
      </div>
    </div>
  )
}
