import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateLessonContent } from '@/lib/engine/contentGenerator'
import { languageDirective } from '@/lib/i18n'
import { z } from 'zod'

const schema = z.object({
  understanding: z.number().min(1).max(5),
  feedback: z.string().max(1000).optional(),
})

// POST /api/lessons/[lessonId]/regenerate
// The adaptive feedback loop: when a learner rates their understanding low,
// the lesson is rewritten with a genuinely different teaching approach,
// targeted at what they said was confusing.
export async function POST(req: Request, { params }: { params: { lessonId: string } }) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', success: false }, { status: 400 })
  const { understanding, feedback } = parsed.data

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: { curriculum: { include: { event: { select: { userId: true, description: true } } } } },
  })
  if (!lesson || lesson.curriculum.event.userId !== session.user.id) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
  }

  // Record the struggle as an attempt — future lessons read this signal
  await prisma.attempt.create({
    data: {
      userId: session.user.id,
      lessonId: lesson.id,
      response: feedback || '(regeneration requested)',
      score: understanding * 20,
      timeSpent: 0,
      confidence: understanding,
      feedback: 'learner-requested-regeneration',
    },
  }).catch(() => {})

  const prior = lesson.content as any
  const regenContext = `${lesson.curriculum.event.description}

REGENERATION REQUEST — the learner rated their understanding ${understanding}/5 on the previous version of this lesson.${feedback ? `
They said the difficulty was: "${feedback}"` : ''}

The previous explanation opened with: "${(prior?.summary || '').slice(0, 300)}"

Take a COMPLETELY DIFFERENT teaching approach this time:
- Use concrete analogies and real-world comparisons instead of abstract definitions
- Break every idea into smaller, more gradual steps
- Directly address the stated difficulty first
- Prefer plain language; introduce jargon only after the intuition is built${languageDirective(session.user.language)}`

  try {
    const content = await generateLessonContent(
      lesson.title,
      lesson.type,
      lesson.duration,
      Math.max(1, lesson.difficulty - 1),
      regenContext,
      { userId: session.user.id, userPlan: session.user.plan }
    )

    await prisma.lesson.update({
      where: { id: lesson.id },
      data: { content: content as object, completed: false, completedAt: null },
    })

    // Refresh quiz rows if the new content carries a quiz
    if (content.quiz?.length) {
      await prisma.attempt.deleteMany({ where: { lessonId: lesson.id, quizId: { not: null } } })
      await prisma.quiz.deleteMany({ where: { lessonId: lesson.id } })
      const VALID_TYPES = ['MCQ', 'FREE_RESPONSE', 'TRUE_FALSE', 'CODE', 'SCENARIO']
      await prisma.quiz.createMany({
        data: content.quiz.map(q => {
          const rawType = String(q.type || 'MCQ').toUpperCase().replace(/[\s-]/g, '_')
          return {
            lessonId: lesson.id,
            question: q.question,
            type: (VALID_TYPES.includes(rawType) ? rawType : 'MCQ') as any,
            options: q.options ?? undefined,
            correctAnswer: String(q.correctAnswer ?? ''),
            explanation: q.explanation || null,
            difficulty: Math.min(5, Math.max(1, Number(q.difficulty) || 3)),
            tags: q.tags || [],
          }
        }),
      })
    }

    const refreshed = await prisma.lesson.findUnique({
      where: { id: lesson.id },
      include: { quizzes: true, attempts: { where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 5 } },
    })
    return NextResponse.json({ data: refreshed, success: true })
  } catch (e: any) {
    console.error('[lesson regenerate]', e)
    const msg = e?.message?.includes('limit') ? e.message : 'Could not regenerate right now. Please try again.'
    return NextResponse.json({ error: msg, success: false }, { status: 500 })
  }
}
