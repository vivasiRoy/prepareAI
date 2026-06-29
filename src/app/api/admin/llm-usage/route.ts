import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  const monthAgo = new Date(Date.now() - 30 * 86400000)

  const [byProvider, byFeature] = await Promise.all([
    prisma.lLMUsageLog.groupBy({
      by: ['provider', 'model'],
      _sum: { costUsd: true, inputTokens: true, outputTokens: true },
      _count: true,
      orderBy: { _sum: { costUsd: 'desc' } },
    }),
    prisma.lLMUsageLog.groupBy({
      by: ['feature'],
      where: { createdAt: { gte: monthAgo } },
      _sum: { costUsd: true },
      _count: true,
      orderBy: { _sum: { costUsd: 'desc' } },
    }),
  ])

  return NextResponse.json({ data: { byProvider, byFeature }, success: true })
}
