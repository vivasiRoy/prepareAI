'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { GeneratedQuiz } from '@/types'

interface QuizModeProps {
  quizzes: (GeneratedQuiz & { id: string })[]
  onSubmitAnswer: (quizId: string, response: string, timeSpent: number) => Promise<{ score: number; isCorrect: boolean; feedback: string; correctAnswer: string }>
  onComplete: (results: { correct: number; total: number; avgScore: number }) => void
}

export function QuizMode({ quizzes, onSubmitAnswer, onComplete }: QuizModeProps) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{ score: number; isCorrect: boolean; feedback: string; correctAnswer: string } | null>(null)
  const [freeResponse, setFreeResponse] = useState('')
  const [startTime] = useState(Date.now())
  const [scores, setScores] = useState<number[]>([])

  const current = quizzes[index]
  const progress = (index / quizzes.length) * 100
  const isMCQ = current?.type === 'MCQ' || current?.type === 'TRUE_FALSE'

  const handleSubmit = async () => {
    const response = isMCQ ? (selected || '') : freeResponse
    if (!response) return

    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    const res = await onSubmitAnswer(current.id, response, timeSpent)
    setResult(res)
    setSubmitted(true)
    setScores(s => [...s, res.score])
  }

  const handleNext = () => {
    if (index < quizzes.length - 1) {
      setIndex(i => i + 1)
      setSelected(null)
      setSubmitted(false)
      setResult(null)
      setFreeResponse('')
    } else {
      const total = scores.length
      const correct = scores.filter(s => s >= 70).length
      const avgScore = total > 0 ? scores.reduce((a, b) => a + b, 0) / total : 0
      onComplete({ correct, total, avgScore })
    }
  }

  if (!current) return null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-400">Question {index + 1} of {quizzes.length}</span>
        <Badge variant="purple">{current.type.replace('_', ' ')}</Badge>
      </div>
      <Progress value={progress} className="mb-6 h-1" />

      <div className="p-6 rounded-xl bg-navy-800 border border-white/10 mb-6">
        <p className="text-lg font-medium text-white leading-relaxed">{current.question}</p>
      </div>

      {isMCQ && current.options ? (
        <div className="space-y-3">
          {current.options.map((option, i) => {
            const isSelected = selected === option
            const isCorrect = submitted && option === result?.correctAnswer
            const isWrong = submitted && isSelected && !result?.isCorrect

            return (
              <button
                key={i}
                disabled={submitted}
                onClick={() => !submitted && setSelected(option)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  isCorrect ? 'border-green-500/60 bg-green-500/10 text-green-300' :
                  isWrong ? 'border-red-500/60 bg-red-500/10 text-red-300' :
                  isSelected ? 'border-purple-500/60 bg-purple-500/10 text-white' :
                  'border-white/10 bg-white/2 text-gray-300 hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{option}</span>
                  {isCorrect && <CheckCircle className="ml-auto w-4 h-4 text-green-400" />}
                  {isWrong && <XCircle className="ml-auto w-4 h-4 text-red-400" />}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <Textarea
          value={freeResponse}
          onChange={e => setFreeResponse(e.target.value)}
          placeholder="Type your answer here..."
          className="min-h-[120px] bg-navy-800 border-white/20"
          disabled={submitted}
        />
      )}

      <AnimatePresence>
        {submitted && result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-4 rounded-lg border ${result.isCorrect ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}
          >
            <div className="flex items-center gap-2 mb-2">
              {result.isCorrect ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
              <span className={`font-semibold ${result.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {result.isCorrect ? `Correct! ${result.score}/100` : `Incorrect — ${result.score}/100`}
              </span>
            </div>
            <p className="text-sm text-gray-300">{result.feedback}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end mt-6">
        {!submitted ? (
          <Button variant="gradient" onClick={handleSubmit} disabled={isMCQ ? !selected : !freeResponse}>
            Submit Answer
          </Button>
        ) : (
          <Button variant="gradient" onClick={handleNext}>
            {index < quizzes.length - 1 ? 'Next Question' : 'See Results'}
            <ChevronRight className="ml-1 w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
