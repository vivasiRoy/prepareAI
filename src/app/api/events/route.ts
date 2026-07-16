import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PLAN_FEATURES } from '@/types'
import { z } from 'zod'

const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(['SOFTWARE_INTERVIEW','JOB_INTERVIEW','ACADEMIC_EXAM','CERTIFICATION_EXAM','PRESENTATION','SALES_PITCH','NEGOTIATION','COURT_CASE','OTHER']),
  description: z.string().min(10).max(2000),
  goalOutcome: z.string().min(10).max(1000),
  targetDate: z.string().datetime(),
})

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'ACTIVE'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: { userId: session.user.id, status: status as any },
      include: {
        curriculum: { select: { id: true, totalDays: true, currentDay: true, generated: true } },
        goals: true,
        _count: { select: { materials: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where: { userId: session.user.id, status: status as any } }),
  ])

  return NextResponse.json({ data: { items: events, total, page, limit, hasMore: page * limit < total }, success: true })
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createEventSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten(), success: false }, { status: 400 })

  const features = PLAN_FEATURES[session.user.plan]
  const activeCount = await prisma.event.count({ where: { userId: session.user.id, status: 'ACTIVE' } })
  if (activeCount >= features.maxEvents) {
    return NextResponse.json({ error: 'Plan limit reached. Upgrade to create more events.', success: false }, { status: 403 })
  }

  const event = await prisma.event.create({
    data: {
      userId: session.user.id,
      title: parsed.data.title,
      type: parsed.data.type,
      description: parsed.data.description,
      goalOutcome: parsed.data.goalOutcome,
      targetDate: new Date(parsed.data.targetDate),
    },
    include: {
      curriculum: true, goals: true, materials: true, metrics: true,
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  })

  // NOTE: Curriculum generation is triggered separately by the client via
  // POST /api/events/[eventId]/curriculum and awaited there. A fire-and-forget
  // promise here would never complete in a serverless environment (the function
  // instance is frozen once the response is returned).
  return NextResponse.json({ data: event, success: true }, { status: 201 })
}
