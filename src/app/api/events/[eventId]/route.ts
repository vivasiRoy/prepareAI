import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET(req: Request, { params }: { params: { eventId: string } }) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const event = await prisma.event.findFirst({
    where: { id: params.eventId, userId: session.user.id },
    include: {
      curriculum: {
        include: {
          lessons: {
            include: {
              quizzes: true,
              attempts: { where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 1 },
            },
            orderBy: [{ dayNumber: 'asc' }, { order: 'asc' }],
          },
        },
      },
      goals: true,
      materials: true,
      user: { select: { id: true, name: true, email: true, image: true } },
      metrics: { orderBy: { date: 'desc' }, take: 7 },
    },
  })

  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  return NextResponse.json({ data: event, success: true })
}

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  goalOutcome: z.string().min(10).max(1000).optional(),
  targetDate: z.string().datetime().optional(),
  status: z.enum(['ACTIVE','PAUSED','ARCHIVED','COMPLETED']).optional(),
})

export async function PATCH(req: Request, { params }: { params: { eventId: string } }) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', success: false }, { status: 400 })

  const event = await prisma.event.findFirst({ where: { id: params.eventId, userId: session.user.id } })
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.event.update({
    where: { id: params.eventId },
    data: { ...parsed.data, targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : undefined },
  })

  return NextResponse.json({ data: updated, success: true })
}

export async function DELETE(req: Request, { params }: { params: { eventId: string } }) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const event = await prisma.event.findFirst({ where: { id: params.eventId, userId: session.user.id } })
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.event.update({ where: { id: params.eventId }, data: { status: 'ARCHIVED' } })
  return NextResponse.json({ data: { archived: true }, success: true })
}
