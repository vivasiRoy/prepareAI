import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateDailyContent } from '@/lib/engine/adaptiveCurriculumEngine'

export async function GET(req: Request, { params }: { params: { lessonId: string } }) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      quizzes: true,
      attempts: { where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 5 },
      curriculum: { include: { event: { select: { userId: true, description: true } } } },
    },
  })

  if (!lesson || lesson.curriculum.event.userId !== session.user.id) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
  }

  const content = lesson.content as any
  if (!content?.summary && !content?.keyPoints?.length) {
    generateDailyContent(params.lessonId).catch(console.error)
  }

  return NextResponse.json({ data: lesson, success: true })
}

export async function PATCH(req: Request, { params }: { params: { lessonId: string } }) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: { curriculum: { include: { event: { select: { userId: true } } } } },
  })

  if (!lesson || lesson.curriculum.event.userId !== session.user.id) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
  }

  const updated = await prisma.lesson.update({
    where: { id: params.lessonId },
    data: {
      title: body.title,
      duration: body.duration,
      difficulty: body.difficulty,
      content: body.content,
      aiGenerated: false,
    },
  })

  return NextResponse.json({ data: updated, success: true })
}
