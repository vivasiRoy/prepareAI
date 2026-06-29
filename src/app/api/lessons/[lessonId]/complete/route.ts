import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updatePerformanceMetrics } from '@/lib/engine/adaptiveScoring'

export async function POST(req: Request, { params }: { params: { lessonId: string } }) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { timeSpent = 0, confidence = 3 } = body

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: { curriculum: { include: { event: { select: { id: true, userId: true } } } } },
  })

  if (!lesson || lesson.curriculum.event.userId !== session.user.id) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
  }

  await prisma.lesson.update({ where: { id: params.lessonId }, data: { completed: true, completedAt: new Date() } })

  const attempt = await prisma.attempt.create({
    data: {
      userId: session.user.id,
      lessonId: params.lessonId,
      response: 'lesson_completed',
      score: 100,
      timeSpent,
      confidence,
      isCorrect: true,
    },
  })

  await updatePerformanceMetrics(attempt as any, lesson.curriculum.event.id)

  const nextLesson = await prisma.lesson.findFirst({
    where: {
      curriculumId: lesson.curriculumId,
      completed: false,
      order: { gt: lesson.order },
    },
    orderBy: [{ dayNumber: 'asc' }, { order: 'asc' }],
  })

  return NextResponse.json({ data: { completed: true, nextLesson }, success: true })
}
