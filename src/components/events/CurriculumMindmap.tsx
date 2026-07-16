'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, PlayCircle, MessageSquare, CheckCircle2, Gauge, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MapLesson {
  id: string
  title: string
  type: string
  dayNumber: number
  difficulty: number
  completed: boolean
  lastScore: number | null
}

interface CurriculumMindmapProps {
  eventId: string
  eventTitle: string
  lessons: MapLesson[]
}

// Phase colors: foundations → violet, core → cyan, applied → emerald, final → amber
const PHASE = [
  { name: 'Foundations', color: '#a78bfa' },
  { name: 'Core skills', color: '#22d3ee' },
  { name: 'Applied practice', color: '#34d399' },
  { name: 'Final sprint', color: '#fbbf24' },
]

function phaseOf(dayNumber: number, maxDay: number): number {
  const r = dayNumber / Math.max(1, maxDay)
  return r <= 0.25 ? 0 : r <= 0.5 ? 1 : r <= 0.8 ? 2 : 3
}

/**
 * Interactive radial mindmap of the whole curriculum. Every lesson is a node
 * around the event core; click a node for readiness, importance, and actions
 * (open the lesson, or dive deeper with the AI tutor).
 */
export function CurriculumMindmap({ eventId, eventTitle, lessons }: CurriculumMindmapProps) {
  const [selected, setSelected] = useState<MapLesson | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  const W = 780
  const H = 560
  const cx = W / 2
  const cy = H / 2

  const maxDay = useMemo(() => Math.max(...lessons.map(l => l.dayNumber), 1), [lessons])

  const nodes = useMemo(() => {
    const n = lessons.length || 1
    return lessons.map((l, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2
      // Two alternating rings so labels don't collide on dense curricula
      const ring = 190 + (i % 2) * 62
      const p = phaseOf(l.dayNumber, maxDay)
      return {
        ...l,
        x: cx + Math.cos(angle) * ring,
        y: cy + Math.sin(angle) * ring * 0.82,
        r: 9 + l.difficulty * 2.2, // importance = size
        color: PHASE[p].color,
        phase: p,
      }
    })
  }, [lessons, maxDay, cx, cy])

  const completedCount = lessons.filter(l => l.completed).length
  const readiness = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0

  const readinessOf = (l: MapLesson) =>
    l.completed ? (l.lastScore != null ? `${Math.round(l.lastScore)}% on last attempt` : 'Completed') : 'Not started'

  return (
    <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.015] overflow-hidden">
      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-3">
        {PHASE.map(p => (
          <span key={p.name} className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} /> {p.name}
          </span>
        ))}
      </div>
      <div className="absolute top-4 right-4 z-10 text-[11px] text-gray-500">
        Node size = importance · Click any node
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" style={{ minHeight: 380 }}>
        {/* Connections */}
        {nodes.map(n => (
          <line
            key={`l-${n.id}`}
            x1={cx} y1={cy} x2={n.x} y2={n.y}
            stroke={n.color}
            strokeOpacity={hovered === n.id || selected?.id === n.id ? 0.5 : 0.14}
            strokeWidth={hovered === n.id || selected?.id === n.id ? 1.6 : 1}
          />
        ))}

        {/* Center node */}
        <g>
          <circle cx={cx} cy={cy} r={64} fill="url(#coreGrad)" opacity={0.92} />
          <circle cx={cx} cy={cy} r={64} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />
          <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize={13} fontWeight={700}>
            {eventTitle.length > 22 ? eventTitle.slice(0, 20) + '…' : eventTitle}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize={11}>
            {readiness}% ready · {completedCount}/{lessons.length}
          </text>
          <defs>
            <radialGradient id="coreGrad">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#0e7490" />
            </radialGradient>
          </defs>
        </g>

        {/* Lesson nodes */}
        {nodes.map(n => (
          <g
            key={n.id}
            onClick={() => setSelected(n)}
            onMouseEnter={() => setHovered(n.id)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={n.x} cy={n.y} r={n.r + (hovered === n.id ? 3 : 0)}
              fill={n.color}
              fillOpacity={n.completed ? 0.9 : 0.22}
              stroke={n.color}
              strokeWidth={selected?.id === n.id ? 3 : 1.5}
              style={{ transition: 'all 150ms' }}
            />
            {n.completed && (
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={11} fill="#0b0b12" fontWeight={800}>✓</text>
            )}
            <text
              x={n.x}
              y={n.y + n.r + 14}
              textAnchor="middle"
              fontSize={9.5}
              fill={hovered === n.id || selected?.id === n.id ? '#fff' : 'rgba(255,255,255,0.55)'}
              style={{ transition: 'fill 150ms' }}
            >
              {n.title.length > 26 ? n.title.slice(0, 24) + '…' : n.title}
            </text>
          </g>
        ))}
      </svg>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 right-0 bottom-0 w-full sm:w-80 bg-[#101018]/95 backdrop-blur-xl border-l border-white/10 p-5 overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                style={{ color: PHASE[phaseOf(selected.dayNumber, maxDay)].color, background: `${PHASE[phaseOf(selected.dayNumber, maxDay)].color}22` }}
              >
                {PHASE[phaseOf(selected.dayNumber, maxDay)].name} · Day {selected.dayNumber}
              </span>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-white font-semibold mb-4 leading-snug">{selected.title}</h3>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex items-center gap-2.5 text-gray-300">
                <CheckCircle2 className={`w-4 h-4 ${selected.completed ? 'text-emerald-400' : 'text-gray-600'}`} />
                <span>Readiness: <span className={selected.completed ? 'text-emerald-300 font-medium' : 'text-gray-500'}>{readinessOf(selected)}</span></span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-300">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Importance: <span className="font-medium text-white">{'●'.repeat(selected.difficulty)}{'○'.repeat(5 - selected.difficulty)}</span></span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-300">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>Format: <span className="text-white">{selected.type.replace(/_/g, ' ').toLowerCase()}</span></span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link href={`/events/${eventId}/learn?lesson=${selected.id}`}>
                <Button variant="gradient" className="w-full">
                  <PlayCircle className="w-4 h-4 mr-2" /> {selected.completed ? 'Review this lesson' : 'Open this lesson'}
                </Button>
              </Link>
              <Link href={`/events/${eventId}/learn?lesson=${selected.id}`}>
                <Button variant="outline" className="w-full border-white/15 text-gray-300">
                  <MessageSquare className="w-4 h-4 mr-2" /> Dive deeper with AI tutor
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
