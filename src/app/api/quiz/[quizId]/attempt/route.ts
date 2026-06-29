import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateLLMResponse } from '@/lib/llm/providers'
import { updatePerformanceMetrics, generateFeedback } from '@/lib/engine/adaptiveScoring'

export async function POST(req: Request, { params }: { params: { quizId: string } }) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { response, timeSpent = 0, confidence = 3 } = body

  if (!response) return NextResponse.json({ error: 'Response required' }, { status: 400 })

  const quiz = await prisma.quiz.findUnique({
    where: { id: params.quizId },
    include: {
      lesson: {
        include: { curriculum: { include: { event: { select: { id: true, userId: true } } } } },
      },
    },
  })

  if (!quiz || quiz.lesson.curriculum.event.userId !== session.user.id) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  let score = 0
  let isCorrect = false

  if (quiz.type === 'MCQ' || quiz.type === 'TRUE_FALSE') {
    isCorrect = response.trim().toLowerCase() === quiz.correctAnswer.trim().toLowerCase()
    score = isCorrect ? 100 : 0
  } else {
    const evalResponse = await generateLLMResponse({
      feature: 'quiz_evaluation',
      userId: session.user.id,
      systemPrompt: 'You are an expert evaluator. Evaluate the answer and return JSON: {"score": number, "isCorrect": boolean}',
      messages: [{
        role: 'user',
        content: `Question: ${quiz.question}\nExpected: ${quiz.correctAnswer}\nUser: ${response}\n\nReturn JSON with score (0-100) and isCorrect (true if score >= 70).`,
      }],
      maxTokens: 300,
      temperature: 0.3,
    })

    try {
      const match = evalResponse.content.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        score = parsed.score || 0
        isCorrect = parsed.isCorrect || score >= 70
      }
    } catch {
      isCorrect = false
      score = 0
    }
  }

  const attempt = await prisma.attempt.create({
    data: {
      userId: session.user.id,
      lessonId: quiz.lessonId,
      quizId: params.quizId,
      response,
      score,
      timeSpent,
      confidence,
      isCorrect,
    },
  })

  const feedback = await generateFeedback(attempt, quiz)
  await prisma.attempt.update({ where: { id: attempt.id }, data: { feedback } })
  await updatePerformanceMetrics({ ...attempt, quiz } as any, quiz.lesson.curriculum.event.id)

  return NextResponse.json({
    data: { score, isCorrect, feedback, correctAnswer: quiz.correctAnswer, explanation: quiz.explanation },
    success: true,
  })
}
