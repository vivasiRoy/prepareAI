import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { streamAnthropic } from '@/lib/llm/anthropic'
import { getModelForPlan } from '@/lib/llm/providers'
import { getRateLimit } from '@/lib/redis'
import { PLAN_FEATURES } from '@/types'

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages, eventId, lessonId } = await req.json()

  const features = PLAN_FEATURES[session.user.plan]
  const rateLimit = await getRateLimit(session.user.id, 'ai_chat', features.dailyAICalls, 86400)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Daily AI limit reached. Upgrade to Pro.', success: false }, { status: 429 })
  }

  let systemPrompt = 'You are PrepareAI, an expert AI tutor helping users prepare for high-stakes events. Be encouraging, specific, and actionable. Keep responses concise and focused.'

  if (eventId) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: session.user.id },
      select: { title: true, type: true, goalOutcome: true, targetDate: true, description: true },
    })
    if (event) {
      const daysLeft = Math.ceil((event.targetDate.getTime() - Date.now()) / 86400000)
      systemPrompt += `\n\nUser's event: ${event.title} (${event.type})\nGoal: ${event.goalOutcome}\nDays until event: ${daysLeft}`
    }
  }

  if (lessonId) {
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { title: true } })
    if (lesson) systemPrompt += `\nCurrent lesson: ${lesson.title}`
  }

  const stream = await streamAnthropic({
    model: getModelForPlan(session.user.plan, 'anthropic'),
    systemPrompt,
    messages,
    maxTokens: 1000,
    temperature: 0.7,
    feature: 'ai_chat',
    userId: session.user.id,
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
    },
  })
}
