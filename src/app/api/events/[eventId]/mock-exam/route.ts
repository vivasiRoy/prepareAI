import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateLLMResponse } from '@/lib/llm/providers'

// POST /api/events/[eventId]/mock-exam
// body: { phase: 'generate', count?: number }
//    OR { phase: 'evaluate', questions: Question[], answers: string[] }
export async function POST(req: Request, { params }: { params: { eventId: string } }) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { phase } = body

  const event = await prisma.event.findFirst({
    where: { id: params.eventId, userId: session.user.id },
    include: {
      curriculum: {
        include: {
          lessons: {
            include: {
              attempts: { where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } },
            },
            orderBy: [{ dayNumber: 'asc' }],
          },
        },
      },
      goals: true,
      metrics: { orderBy: { date: 'desc' }, take: 5 },
    },
  })

  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const daysUntil = Math.max(0, Math.ceil((new Date(event.targetDate).getTime() - Date.now()) / 86400000))

  if (phase === 'generate') {
    const count = Math.min(body.count || 15, 20)

    // Build performance context
    const lessons = event.curriculum?.lessons || []
    const completedLessons = lessons.filter(l => l.completed)
    const topicsWeak = (event.metrics[0]?.topicsWeak as string[]) || []
    const topicsStrong = (event.metrics[0]?.topicsStrong as string[]) || []
    const avgAccuracy = event.metrics.length > 0
      ? event.metrics.reduce((s, m) => s + m.accuracyRate, 0) / event.metrics.length
      : 50

    // Urgency mode
    let examMode: string
    let mcqRatio: number
    if (daysUntil <= 3) {
      examMode = 'FINAL_SPRINT — simulate real exam conditions exactly. Focus on hardest likely questions.'
      mcqRatio = 0.5
    } else if (daysUntil <= 7) {
      examMode = 'URGENT — bias toward weak areas and realistic exam scenarios.'
      mcqRatio = 0.6
    } else if (daysUntil <= 14) {
      examMode = 'FOCUSED — mix of curriculum topics with emphasis on weak areas.'
      mcqRatio = 0.7
    } else {
      examMode = 'BALANCED — even coverage across all curriculum topics.'
      mcqRatio = 0.8
    }

    const mcqCount = Math.round(count * mcqRatio)
    const openCount = count - mcqCount

    const topicsContext = completedLessons.length > 0
      ? `Covered topics: ${completedLessons.map(l => l.title).join(', ')}`
      : `General ${event.type.replace(/_/g, ' ').toLowerCase()} preparation`

    const weakContext = topicsWeak.length > 0
      ? `User is weak in: ${topicsWeak.join(', ')}`
      : ''

    const prompt = `You are generating a mock exam for: "${event.title}"
Event type: ${event.type.replace(/_/g, ' ')}
Goal: ${event.goalOutcome || 'Pass successfully'}
Days until event: ${daysUntil}
Mode: ${examMode}
${topicsContext}
${weakContext}
Current accuracy: ${Math.round(avgAccuracy)}%

Generate exactly ${count} exam questions:
- ${mcqCount} multiple-choice questions (4 options each)
- ${openCount} open/short-answer questions

Requirements:
- Questions must be realistic and match what would appear in the actual ${event.type.replace(/_/g, ' ')} context
- MCQ options must be plausible (no obviously wrong options)
- Difficulty should reflect urgency: ${daysUntil <= 7 ? 'medium-hard to hard' : 'easy to medium-hard mix'}
- For weak topics (${topicsWeak.join(', ') || 'none identified'}), add extra questions

Return ONLY valid JSON, no markdown:
{
  "questions": [
    {
      "id": "q1",
      "type": "MCQ",
      "topic": "topic name",
      "difficulty": 3,
      "question": "Question text",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "A) ...",
      "explanation": "Why this is correct"
    },
    {
      "id": "q2",
      "type": "OPEN",
      "topic": "topic name",
      "difficulty": 3,
      "question": "Question text",
      "sampleAnswer": "Key points expected in a good answer",
      "evaluationCriteria": ["criterion 1", "criterion 2"]
    }
  ]
}`

    const response = await generateLLMResponse({
      provider: 'anthropic',
      model: 'claude-sonnet-4-5-20251001',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 4000,
      temperature: 0.7,
      feature: 'mock-exam-generate',
      userId: session.user.id,
    })

    let questions
    try {
      const raw = response.content.replace(/^```json\n?/, '').replace(/\n?```$/, '')
      questions = JSON.parse(raw).questions
    } catch {
      return NextResponse.json({ error: 'Failed to parse exam questions' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { questions, daysUntil, mode: examMode, eventTitle: event.title },
    })
  }

  if (phase === 'evaluate') {
    const { questions, answers } = body as {
      questions: Array<{
        id: string; type: string; topic: string; difficulty: number
        question: string; options?: string[]; correctAnswer?: string
        sampleAnswer?: string; evaluationCriteria?: string[]; explanation?: string
      }>
      answers: string[]
    }

    if (!questions || !answers || questions.length !== answers.length) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Evaluate all answers at once
    const qaBlock = questions.map((q, i) => {
      const userAnswer = answers[i] || '(no answer)'
      if (q.type === 'MCQ') {
        return `Q${i + 1} [MCQ, topic: ${q.topic}]: ${q.question}
User selected: ${userAnswer}
Correct answer: ${q.correctAnswer}
Explanation: ${q.explanation || ''}`
      }
      return `Q${i + 1} [Open, topic: ${q.topic}]: ${q.question}
User answer: ${userAnswer}
Expected: ${q.sampleAnswer || ''}
Criteria: ${(q.evaluationCriteria || []).join('; ')}`
    }).join('\n\n')

    const evalPrompt = `You are evaluating a mock exam for "${event.title}" (${daysUntil} days until the event).

${qaBlock}

For each question, score and give feedback. Then provide overall analysis.

Return ONLY valid JSON:
{
  "results": [
    {
      "questionId": "q1",
      "score": 1,
      "isCorrect": true,
      "feedback": "Brief feedback on the answer",
      "improvement": "What to improve or study"
    }
  ],
  "overallScore": 75,
  "strongTopics": ["topic1"],
  "weakTopics": ["topic2"],
  "recommendation": "2-3 sentence recommendation on what to focus on given ${daysUntil} days remaining",
  "readinessLevel": "READY|ALMOST_READY|NEEDS_WORK|CRITICAL"
}`

    const evalResponse = await generateLLMResponse({
      provider: 'anthropic',
      model: 'claude-sonnet-4-5-20251001',
      messages: [{ role: 'user', content: evalPrompt }],
      maxTokens: 3000,
      temperature: 0.3,
      feature: 'mock-exam-evaluate',
      userId: session.user.id,
    })

    let evaluation
    try {
      const raw = evalResponse.content.replace(/^```json\n?/, '').replace(/\n?```$/, '')
      evaluation = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'Failed to parse evaluation' }, { status: 500 })
    }

    // Save performance metrics
    try {
      const score = evaluation.overallScore || 0
      await prisma.performanceMetrics.create({
        data: {
          userId: session.user.id,
          eventId: params.eventId,
          successScore: score,
          accuracyRate: score,
          avgTimePerQuestion: 0,
          questionsAnswered: questions.length,
          topicsStrong: evaluation.strongTopics || [],
          topicsWeak: evaluation.weakTopics || [],
          retentionScore: score,
          streak: 0,
        },
      })
      // Update event success score
      await prisma.event.update({
        where: { id: params.eventId },
        data: { successScore: score },
      })
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ success: true, data: evaluation })
  }

  return NextResponse.json({ error: 'Unknown phase' }, { status: 400 })
}
