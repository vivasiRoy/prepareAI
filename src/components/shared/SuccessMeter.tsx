'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getScoreColor, getScoreLabel } from '@/lib/utils'

interface SuccessMeterProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function SuccessMeter({ score, size = 'md', showLabel = true, className = '' }: SuccessMeterProps) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  const sizes = { sm: { r: 30, stroke: 4, dim: 80, fontSize: 'text-lg' }, md: { r: 50, stroke: 6, dim: 130, fontSize: 'text-2xl' }, lg: { r: 70, stroke: 8, dim: 170, fontSize: 'text-4xl' } }
  const s = sizes[size]
  const circumference = 2 * Math.PI * s.r
  const strokeDash = circumference - (displayed / 100) * circumference

  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: s.dim, height: s.dim }}>
        <svg width={s.dim} height={s.dim} className="-rotate-90">
          <circle cx={s.dim / 2} cy={s.dim / 2} r={s.r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={s.stroke} />
          <motion.circle
            cx={s.dim / 2} cy={s.dim / 2} r={s.r}
            fill="none" stroke={color} strokeWidth={s.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeDash }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${s.fontSize} font-bold`} style={{ color }}>{Math.round(displayed)}%</span>
          {size !== 'sm' && <span className="text-xs text-gray-400 mt-0.5">Ready</span>}
        </div>
      </div>
      {showLabel && (
        <div className="mt-2 text-center">
          <span className="text-sm font-medium" style={{ color }}>{getScoreLabel(score)}</span>
        </div>
      )}
    </div>
  )
}
