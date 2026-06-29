import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateFlashCards, generateQuiz, generateSimulation } from '@/lib/engine/contentGenerator'
import { PLAN_FEATURES } from '@/types'
import { z } from 'zod'

const schema = z.object({
  lessonId: z.string(),
  type: z.enum(['flashcard', 'quiz', 'simulation']),
  count: z.number().min(1).max(20).default(5),
})

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', success: false }, { status: 400 })

  const { lessonId, type, count } = parsed.data

  if (type === 'simulation' && !PLAN_FEATURES[session.user.plan].simulations) {
    return NextResponse.json({ error: 'Simulations require Pro plan', success: false }, { status: 403 })
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { curriculum: { include: { event: { select: { userId: true, type: true, description: true } } } } },
  })

  if (!lesson || lesson.curriculum.event.userId !== session.user.id) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
  }

  let content: unknown
  if (type === 'flashcard') {
    content = await generateFlashCards(lesson.title, count, lesson.difficulty)
  } else if (type === 'quiz') {
    content = await generateQuiz(lesson.title, 'MCQ', count, lesson.difficulty)
  } else {
    content = await generateSimulation(lesson.curriculum.event.type, lesson.title, lesson.difficulty)
  }

  return NextResponse.json({ data: content, success: true })
}
