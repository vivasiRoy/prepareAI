import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(Date.now() - 7 * 86400000)
  const monthAgo = new Date(Date.now() - 30 * 86400000)

  const [totalUsers, newToday, newThisWeek, usersByPlan, totalEvents, activeEvents, eventsByType, llmAll, llmMonth, subs] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.groupBy({ by: ['plan'], _count: true }),
    prisma.event.count(),
    prisma.event.count({ where: { status: 'ACTIVE' } }),
    prisma.event.groupBy({ by: ['type'], _count: true }),
    prisma.lLMUsageLog.aggregate({ _sum: { costUsd: true, inputTokens: true, outputTokens: true }, _count: true }),
    prisma.lLMUsageLog.aggregate({ where: { createdAt: { gte: monthAgo } }, _sum: { costUsd: true }, _count: true }),
    prisma.subscription.groupBy({ by: ['plan', 'status'], _count: true }),
  ])

  const mrr = subs.filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.plan === 'PRO' ? 29 : s.plan === 'ENTERPRISE' ? 99 : 0) * s._count, 0)

  return NextResponse.json({
    data: {
      users: {
        total: totalUsers,
        newToday,
        newThisWeek,
        byPlan: Object.fromEntries(usersByPlan.map(p => [p.plan, p._count])),
      },
      events: {
        total: totalEvents,
        active: activeEvents,
        byType: Object.fromEntries(eventsByType.map(e => [e.type, e._count])),
      },
      llmUsage: {
        totalCost: llmAll._sum.costUsd || 0,
        totalCalls: llmAll._count,
        last30DaysCost: llmMonth._sum.costUsd || 0,
        last30DaysCalls: llmMonth._count,
      },
      subscriptions: { mrr, byPlan: subs },
    },
    success: true,
  })
}
