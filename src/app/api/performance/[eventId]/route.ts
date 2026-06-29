import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateSuccessScore, getAdaptiveRecommendations } from '@/lib/engine/adaptiveScoring'
import { calculateDaysUntil } from '@/lib/utils'

export async function GET(req: Request, { params }: { params: { eventId: string } }) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const event = await prisma.event.findFirst({ where: { id: params.eventId, userId: session.user.id } })
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const [metrics, recommendations, successScore, completedLessons, totalLessons] = await Promise.all([
    prisma.performanceMetrics.findMany({
      where: { userId: session.user.id, eventId: params.eventId },
      orderBy: { date: 'desc' },
      take: 30,
    }),
    getAdaptiveRecommendations(session.user.id, params.eventId),
    calculateSuccessScore(session.user.id, params.eventId),
    prisma.lesson.count({ where: { curriculum: { eventId: params.eventId }, completed: true } }),
    prisma.lesson.count({ where: { curriculum: { eventId: params.eventId } } }),
  ])

  const latest = metrics[0]
  const daysUntilEvent = calculateDaysUntil(event.targetDate)

  return NextResponse.json({
    data: {
      successProbability: successScore,
      streak: latest?.streak || 0,
      topicsStrong: (latest?.topicsStrong as string[]) || [],
      topicsWeak: (latest?.topicsWeak as string[]) || [],
      nextFocus: recommendations.focusTopics[0] || 'Continue with today\'s lesson',
      daysUntilEvent,
      accuracyRate: latest?.accuracyRate || 0,
      totalAttempts: latest?.questionsAnswered || 0,
      completedLessons,
      totalLessons,
      dailyMetrics: metrics,
      recommendations,
    },
    success: true,
  })
}
