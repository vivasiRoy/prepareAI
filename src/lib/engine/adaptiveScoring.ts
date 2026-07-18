import { prisma } from '@/lib/prisma'
import { generateLLMResponse } from '@/lib/llm/providers'
import type { Attempt, Quiz } from '@/generated/prisma'
import { calculateSuccessProbability } from '@/lib/utils'

export async function calculateSuccessScore(userId: string, eventId: string): Promise<number> {
  const metrics = await prisma.performanceMetrics.findMany({
    where: { userId, eventId },
    orderBy: { date: 'desc' },
    take: 10,
  })

  if (metrics.length === 0) return 0

  const latest = metrics[0]
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { targetDate: true } })
  const daysUntilEvent = event ? Math.ceil((event.targetDate.getTime() - Date.now()) / 86400000) : 30

  const score = calculateSuccessProbability({
    accuracyRate: latest.accuracyRate,
    streak: latest.streak,
    daysUntilEvent,
    questionsAnswered: latest.questionsAnswered,
    retentionScore: latest.retentionScore,
  })

  await prisma.event.update({ where: { id: eventId }, data: { successScore: score } })
  return score
}

export async function updatePerformanceMetrics(
  attempt: Attempt & { quiz?: Quiz | null },
  eventId: string
): Promise<void> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existing = await prisma.performanceMetrics.findUnique({
    where: { userId_eventId_date: { userId: attempt.userId, eventId, date: today } },
  })

  const prevMetrics = await prisma.performanceMetrics.findFirst({
    where: { userId: attempt.userId, eventId },
    orderBy: { date: 'desc' },
  })

  const streak = prevMetrics?.streak || 0
  const newStreak = existing ? streak : streak + 1

  if (existing) {
    const totalQ = existing.questionsAnswered + 1
    const correctBefore = existing.accuracyRate * existing.questionsAnswered / 100
    const newCorrect = correctBefore + (attempt.isCorrect ? 1 : 0)
    const newAccuracy = (newCorrect / totalQ) * 100
    const newAvgTime = ((existing.avgTimePerQuestion * existing.questionsAnswered) + attempt.timeSpent) / totalQ

    await prisma.performanceMetrics.update({
      where: { id: existing.id },
      data: {
        questionsAnswered: totalQ,
        accuracyRate: newAccuracy,
        avgTimePerQuestion: Math.round(newAvgTime),
        successScore: await calculateSuccessScore(attempt.userId, eventId),
      },
    })
  } else {
    await prisma.performanceMetrics.create({
      data: {
        userId: attempt.userId,
        eventId,
        date: today,
        successScore: 0,
        accuracyRate: attempt.isCorrect ? 100 : 0,
        avgTimePerQuestion: attempt.timeSpent,
        questionsAnswered: 1,
        topicsStrong: [],
        topicsWeak: attempt.isCorrect ? [] : [attempt.quizId || ''],
        retentionScore: attempt.isCorrect ? 100 : 0,
        streak: newStreak,
      },
    })

    await calculateSuccessScore(attempt.userId, eventId)
  }
}

export async function getAdaptiveRecommendations(userId: string, eventId: string) {
  const recentAttempts = await prisma.attempt.findMany({
    where: { userId, lesson: { curriculum: { eventId } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { quiz: true },
  })

  const accuracyRate = recentAttempts.length > 0
    ? (recentAttempts.filter(a => a.isCorrect).length / recentAttempts.length) * 100
    : 50

  let difficultyAdjust = 0
  if (accuracyRate < 50) difficultyAdjust = -1
  else if (accuracyRate > 85) difficultyAdjust = 1

  const weakTopics = recentAttempts
    .filter(a => !a.isCorrect && a.quiz?.tags)
    .flatMap(a => a.quiz!.tags)
    .slice(0, 5)

  return {
    adjustDifficulty: difficultyAdjust,
    focusTopics: weakTopics,
    skipTopics: [],
    estimatedReadiness: Math.round(accuracyRate),
    suggestedPace: accuracyRate > 80 ? 'accelerate' : accuracyRate < 50 ? 'slow' : 'normal',
  }
}

export async function generateFeedback(attempt: Attempt, quiz: Quiz): Promise<string> {
  const isCorrect = attempt.isCorrect

  if (isCorrect && attempt.score >= 90) {
    return 'Excellent! Your answer demonstrates strong understanding of this concept.'
  }

  const response = await generateLLMResponse({
    feature: 'feedback_generation',
    systemPrompt: 'You are an encouraging tutor. Give brief, specific, actionable feedback in 2-3 sentences.',
    messages: [{
      role: 'user',
      content: "Question: " + quiz.question + "\nCorrect answer: " + quiz.correctAnswer + "\nUser answered: " + attempt.response + "\nScore: " + attempt.score + "/100\n\nGive encouraging feedback explaining what was right/wrong and how to improve.",
    }],
    maxTokens: 300,
    temperature: 0.7,
  })

  return response.content
}
