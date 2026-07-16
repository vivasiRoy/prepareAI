import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateCurriculum } from '@/lib/engine/adaptiveCurriculumEngine'

// Per-user data — never statically optimized or CDN-cached
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request, { params }: { params: { eventId: string } }) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const curriculum = await prisma.curriculum.findFirst({
    where: { event: { id: params.eventId, userId: session.user.id } },
    include: {
      lessons: {
        include: {
          quizzes: true,
          attempts: { where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: [{ dayNumber: 'asc' }, { order: 'asc' }],
      },
    },
  })

  if (!curriculum) return NextResponse.json({ error: 'Curriculum not found' }, { status: 404 })
  return NextResponse.json({ data: curriculum, success: true })
}

export async function POST(req: Request, { params }: { params: { eventId: string } }) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const event = await prisma.event.findFirst({
    where: { id: params.eventId, userId: session.user.id },
    include: {
      materials: true, goals: true, curriculum: true, metrics: true,
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  })
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const result = await generateCurriculum({ event: event as any, userId: session.user.id, plan: session.user.plan, language: session.user.language })

  if (event.curriculum) {
    await prisma.lesson.deleteMany({ where: { curriculumId: event.curriculum.id } })
    await prisma.curriculum.update({
      where: { id: event.curriculum.id },
      data: {
        totalDays: result.lessons.length, generated: true,
        outline: result.outline as any, skillTree: result.skillTree as any, domainContext: result.domainContext as any,
      },
    })
    await prisma.lesson.createMany({
      data: result.lessons.map(l => ({
        curriculumId: event.curriculum!.id, dayNumber: l.dayNumber, title: l.title,
        type: l.type, content: l.content as any, duration: l.duration, difficulty: l.difficulty, order: l.order,
      })),
    })
  } else {
    const curriculum = await prisma.curriculum.create({
      data: {
        eventId: params.eventId, totalDays: result.lessons.length, generated: true,
        outline: result.outline as any, skillTree: result.skillTree as any, domainContext: result.domainContext as any,
      },
    })
    await prisma.lesson.createMany({
      data: result.lessons.map(l => ({
        curriculumId: curriculum.id, dayNumber: l.dayNumber, title: l.title,
        type: l.type, content: l.content as any, duration: l.duration, difficulty: l.difficulty, order: l.order,
      })),
    })
  }

  const updated = await prisma.curriculum.findUnique({
    where: { eventId: params.eventId },
    include: { lessons: { orderBy: [{ dayNumber: 'asc' }, { order: 'asc' }] } },
  })
  return NextResponse.json({ data: updated, success: true })
}
