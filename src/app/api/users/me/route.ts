import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET() {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [user, aiCallsToday, aiCallsMonth, referrals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, name: true, email: true, image: true, role: true, plan: true, language: true, createdAt: true,
        subscription: true,
        _count: { select: { events: { where: { status: 'ACTIVE' } } } },
      },
    }),
    prisma.lLMUsageLog.count({ where: { userId: session.user.id, createdAt: { gte: startOfDay } } }),
    prisma.lLMUsageLog.count({ where: { userId: session.user.id, createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { referredBy: session.user.id } }),
  ])

  return NextResponse.json({ data: { ...user, usage: { aiCallsToday, aiCallsMonth }, referrals }, success: true })
}

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional(),
  language: z.enum(['en', 'es', 'fr', 'de', 'pt', 'hi', 'ar', 'zh']).optional(),
})

export async function PATCH(req: Request) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', success: false }, { status: 400 })

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: { id: true, name: true, email: true, image: true, plan: true, role: true },
  })

  return NextResponse.json({ data: user, success: true })
}
