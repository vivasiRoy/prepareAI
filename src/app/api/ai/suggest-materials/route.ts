import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { generateLLMResponse } from '@/lib/llm/providers'
import { z } from 'zod'

const schema = z.object({
  type: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  goalOutcome: z.string().max(1000).optional(),
})

// Static fallbacks if the AI call fails — still useful, instantly rendered
const FALLBACKS: Record<string, { name: string; why: string }[]> = {
  SOFTWARE_INTERVIEW: [
    { name: 'The job description', why: 'Aligns drills with the exact skills they screen for' },
    { name: 'Your resume/CV', why: 'Behavioral questions are built from your own stories' },
    { name: "The company's engineering blog", why: 'Reveals their stack and system-design patterns' },
  ],
  JOB_INTERVIEW: [
    { name: 'The job posting', why: 'Every answer gets tailored to their requirements' },
    { name: 'Your resume/CV', why: 'Your mock panel will probe your actual experience' },
    { name: 'Company about/values page URL', why: 'Culture-fit questions come from these' },
  ],
  ACADEMIC_EXAM: [
    { name: 'The syllabus or exam outline', why: 'The plan mirrors exactly what is examinable' },
    { name: 'Lecture notes or slides', why: 'Lessons reuse your course terminology' },
    { name: 'A past paper link', why: 'Question drills match the real format' },
  ],
  CERTIFICATION_EXAM: [
    { name: 'The official exam blueprint URL', why: 'Weighting follows the real domains' },
    { name: 'Your practice test results', why: 'Weak domains get extra coverage' },
  ],
  SALES_PITCH: [
    { name: "The prospect's website URL", why: 'Objection roleplay uses their actual business' },
    { name: 'Your pitch deck notes', why: 'Feedback targets your real material' },
  ],
  NEGOTIATION: [
    { name: 'The current offer/contract terms', why: 'BATNA analysis needs real numbers' },
    { name: 'Market/comp research links', why: 'Anchors get grounded in data' },
  ],
  PRESENTATION: [
    { name: 'Your slide outline or script', why: 'Delivery coaching works on your actual talk' },
    { name: 'Audience/event page URL', why: 'Q&A simulation matches who is in the room' },
  ],
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', success: false }, { status: 400 })
  const { type, title, description, goalOutcome } = parsed.data

  try {
    const response = await generateLLMResponse({
      feature: 'material_suggestions',
      userId: session.user.id,
      userPlan: session.user.plan,
      maxTokens: 600,
      temperature: 0.4,
      systemPrompt: 'You suggest concrete reference materials a person should add to their AI preparation plan. Respond with ONLY valid JSON.',
      messages: [{
        role: 'user',
        content: `Event: ${title} (${type.replace(/_/g, ' ')})\nDetails: ${description}\nGoal: ${goalOutcome || 'succeed'}\n\nSuggest 3-5 SPECIFIC materials (documents, URLs, videos) this person should add so the AI can personalize their preparation. Be concrete to THIS event, not generic.\n\nReturn JSON: {"suggestions":[{"name":"short material name","why":"one-line benefit"}]}`,
      }],
    })
    const match = response.content.match(/\{[\s\S]*\}/)
    if (match) {
      const data = JSON.parse(match[0])
      if (Array.isArray(data.suggestions) && data.suggestions.length) {
        return NextResponse.json({ data: data.suggestions.slice(0, 5), success: true })
      }
    }
  } catch {}

  return NextResponse.json({
    data: FALLBACKS[type] || [
      { name: 'Any official outline or brief', why: 'Grounds the plan in the real requirements' },
      { name: 'Your own notes so far', why: 'The AI builds on what you already know' },
    ],
    success: true,
  })
}
