import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatRelativeDate(date: Date | string): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return days + ' days ago'
  if (days < 30) return Math.floor(days / 7) + ' weeks ago'
  return formatDate(date)
}

export function calculateDaysUntil(date: Date | string): number {
  const now = new Date()
  const target = new Date(date)
  const diff = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function calculateSuccessProbability(metrics: {
  accuracyRate: number
  streak: number
  daysUntilEvent: number
  questionsAnswered: number
  retentionScore?: number
}): number {
  const { accuracyRate, streak, daysUntilEvent, questionsAnswered, retentionScore = 0 } = metrics

  const accuracyWeight = accuracyRate * 0.40
  const streakWeight = Math.min(streak / 14, 1) * 100 * 0.20
  const practiceWeight = Math.min(questionsAnswered / 100, 1) * 100 * 0.20
  const retentionWeight = retentionScore * 0.20

  let score = accuracyWeight + streakWeight + practiceWeight + retentionWeight

  if (daysUntilEvent < 3 && score < 60) {
    score = score * 0.85
  }

  return Math.min(100, Math.max(0, Math.round(score)))
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function getEventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    INTERVIEW: 'Job Interview',
    EXAM: 'Exam',
    CERTIFICATION: 'Certification',
    PRESENTATION: 'Presentation',
    MEETING: 'Meeting',
    SALES_PITCH: 'Sales Pitch',
    NEGOTIATION: 'Negotiation',
    COURT_CASE: 'Court Case',
    ACADEMIC_ASSESSMENT: 'Academic Assessment',
    OTHER: 'Other',
  }
  return labels[type] || type
}

export function getScoreColor(score: number): string {
  if (score >= 75) return 'text-green-400'
  if (score >= 50) return 'text-yellow-400'
  return 'text-red-400'
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'High Confidence'
  if (score >= 60) return 'On Track'
  if (score >= 40) return 'Needs Focus'
  return 'Low Readiness'
}
