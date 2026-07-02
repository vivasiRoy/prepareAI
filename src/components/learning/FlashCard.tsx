'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { FlashCard as FlashCardType } from '@/types'

interface FlashCardDeckProps {
  cards: FlashCardType[]
  onComplete: (results: { got: number; review: number }) => void
}

export function FlashCardDeck({ cards, onComplete }: FlashCardDeckProps) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState<Record<number, 'got' | 'review'>>({})
  const [done, setDone] = useState(false)

  const current = cards[index]
  const progress = ((Object.keys(results).length) / cards.length) * 100

  const handleFlip = useCallback(() => setFlipped(f => !f), [])

  const handleResult = useCallback((result: 'got' | 'review') => {
    const newResults = { ...results, [index]: result }
    setResults(newResults)
    if (index < cards.length - 1) {
      setIndex(i => i + 1)
      setFlipped(false)
    } else {
      const got = Object.values(newResults).filter(r => r === 'got').length
      setDone(true)
      onComplete({ got, review: cards.length - got })
    }
  }, [results, index, cards.length, onComplete])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); handleFlip() }
      if (e.code === 'ArrowRight' && flipped) handleResult('got')
      if (e.code === 'ArrowLeft' && flipped) handleResult('review')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [flipped, index, handleFlip, handleResult])

  if (done) {
    const gotCount = Object.values(results).filter(r => r === 'got').length
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">Deck Complete!</h3>
        <p className="text-gray-400 mb-6">You got <span className="text-green-400 font-semibold">{gotCount}</span> of {cards.length} cards</p>
        <Button variant="gradient" onClick={() => { setIndex(0); setFlipped(false); setResults({}); setDone(false) }}>
          <RotateCcw className="w-4 h-4 mr-2" /> Restart
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-400">Card {index + 1} of {cards.length}</span>
        <span className="text-xs text-gray-500">Press Space to flip</span>
      </div>
      <Progress value={progress} className="mb-6 h-1" />

      <div className="relative h-64 cursor-pointer" onClick={handleFlip} style={{ perspective: 1000 }}>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full h-full"
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl border border-white/10 bg-navy-800 flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Question</p>
            <p className="text-xl font-semibold text-white">{current?.front}</p>
            {current?.hint && <p className="text-sm text-gray-400 mt-4 italic">Hint: {current.hint}</p>}
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl border border-purple-500/30 bg-purple-900/20 flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Answer</p>
            <p className="text-lg text-white">{current?.back}</p>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {flipped && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 mt-6">
            <Button variant="outline" className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => handleResult('review')}>
              <XCircle className="w-4 h-4 mr-2" /> Review Again
            </Button>
            <Button variant="outline" className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10" onClick={() => handleResult('got')}>
              <CheckCircle className="w-4 h-4 mr-2" /> Got It
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
