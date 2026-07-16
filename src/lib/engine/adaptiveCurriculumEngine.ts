import { generateLLMResponse } from '@/lib/llm/providers'
import { classifyEvent } from './domainClassifier'
import { generateLessonContent } from './contentGenerator'
import { getDomainTemplate } from '@/templates/domains'
import { prisma } from '@/lib/prisma'
import { languageDirective } from '@/lib/i18n'
import type { EventWithRelations, GeneratedLesson } from '@/types'
import type { LessonType, Plan } from '@/generated/prisma'

function calculateDaysUntil(targetDate: Date): number {
  const now = new Date()
  const diff = targetDate.getTime() - now.getTime()
  return Math.max(7, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function getLessonTypeForPhase(phase: number, totalPhases: number, index: number): LessonType {
  const phaseRatio = phase / totalPhases
  if (phaseRatio < 0.2) return index % 2 === 0 ? 'MICRO_LESSON' : 'FLASHCARD'
  if (phaseRatio < 0.5) return index % 3 === 0 ? 'QUIZ' : index % 3 === 1 ? 'FLASHCARD' : 'MICRO_LESSON'
  if (phaseRatio < 0.8) return index % 2 === 0 ? 'SIMULATION' : 'QUIZ'
  return index % 2 === 0 ? 'MOCK_INTERVIEW' : 'MOCK_EXAM'
}

export async function generateCurriculum(params: {
  event: EventWithRelations
  userId: string
  plan: Plan
  language?: string
}): Promise<{ lessons: GeneratedLesson[]; outline: object; skillTree: object; domainContext: object }> {
  const { event, userId, plan, language } = params

  const totalDays = calculateDaysUntil(event.targetDate)
  const template = getDomainTemplate(event.type, event.description)
  const domain = await classifyEvent(event.description, event.type, event.goalOutcome)

  // User-provided materials (uploads, URLs, videos) steer the curriculum —
  // the whole point of adding them is that the plan reflects their content.
  const materialsContext = (event.materials || [])
    .slice(0, 8)
    .map(m => {
      let ex: { summary?: string; topics?: string[]; keyPoints?: string[] } = {}
      try { ex = JSON.parse(m.extractedContent || '{}') } catch {}
      const summary = ex.summary || (m.content || '').slice(0, 250)
      const topics = ex.topics?.length ? ` [topics: ${ex.topics.slice(0, 6).join(', ')}]` : ''
      return summary ? `- "${m.name}": ${summary}${topics}` : null
    })
    .filter(Boolean)
    .join('\n')

  const outlinePrompt = `Create a ${totalDays}-day preparation curriculum for this SPECIFIC event.

Event title: ${event.title}
Event type: ${event.type.replace(/_/g, ' ')}
Description: ${event.description}
Goal: ${event.goalOutcome}
Key skills needed: ${domain.keySkills.join(', ')}
Core topics: ${domain.coreTopics.join(', ')}${materialsContext ? `

The user provided these reference materials — weave their specific content, topics, and terminology into the daily plan (they are the highest-signal source of what will actually be tested/needed):
${materialsContext}` : ''}

Design ${totalDays} daily topics that are SPECIFIC to this exact subject matter — reference the actual concepts, not generic study advice. For a linear algebra exam, that means topics like "Vector spaces and subspaces", "Eigenvalues and eigenvectors", "Matrix diagonalization" — NOT "Core Subject Matter Review".

Progress difficulty from foundational (day 1) to exam-level (final day). Vary lessonType across: MICRO_LESSON, FLASHCARD, QUIZ, SIMULATION, MOCK_EXAM.

Return ONLY valid JSON (no markdown, no commentary), exactly this shape:
{"dailyTopics":[{"day":1,"topic":"specific topic name","focus":"what to master this day","lessonType":"MICRO_LESSON","duration":25,"difficulty":2}],"skillTree":{"nodes":[{"id":"n1","name":"skill","prerequisites":[]}]},"weeklyMilestones":[{"week":1,"milestone":"specific milestone"}]}${languageDirective(language)}`

  const outlineResponse = await generateLLMResponse({
    feature: 'curriculum_generation',
    userId,
    userPlan: plan,
    systemPrompt: 'You are an expert learning designer. You create highly specific, subject-accurate curricula. You respond with ONLY valid JSON — never markdown fences, never prose.',
    messages: [{ role: 'user', content: outlinePrompt }],
    maxTokens: 6000,
    temperature: 0.6,
  })

  let outline: {
    dailyTopics: Array<{ day: number; topic: string; focus: string; lessonType: string; duration: number; difficulty: number }>
    skillTree: object
    weeklyMilestones: Array<{ week: number; milestone: string }>
  } = {
    dailyTopics: [],
    skillTree: {},
    weeklyMilestones: [],
  }

  try {
    const cleaned = outlineResponse.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) outline = JSON.parse(match[0])
  } catch {}

  if (!outline.dailyTopics || outline.dailyTopics.length === 0) {
    outline.dailyTopics = Array.from({ length: Math.min(totalDays, 30) }, (_, i) => {
      const topicIndex = i % template.coreTopics.length
      return {
        day: i + 1,
        topic: template.coreTopics[topicIndex] || 'Core Concepts',
        focus: 'Master fundamentals and build confidence',
        lessonType: getLessonTypeForPhase(i, totalDays, i),
        duration: 20,
        difficulty: Math.min(5, Math.ceil((i / totalDays) * 5) + 1),
      }
    })
  }

  // Only the outline is generated up front (a single LLM call), so curriculum
  // creation stays well under Firebase Hosting's 60s request limit. Each
  // lesson's detailed content is generated on demand (synchronously) the first
  // time the user opens it — see the lesson GET route.
  const lessons: GeneratedLesson[] = outline.dailyTopics.map((dayInfo, idx) => ({
    dayNumber: dayInfo.day,
    title: dayInfo.topic,
    type: (dayInfo.lessonType as LessonType) || 'MICRO_LESSON',
    content: { summary: '', keyPoints: [], examples: [] },
    duration: dayInfo.duration || 20,
    difficulty: dayInfo.difficulty || 3,
    order: idx,
  }))

  return {
    lessons,
    outline,
    skillTree: (outline.skillTree as object) || {},
    domainContext: {
      primaryDomain: domain.primaryDomain,
      subDomains: domain.subDomains,
      keySkills: domain.keySkills,
      estimatedDifficulty: domain.estimatedDifficulty,
      templateUsed: template.id,
    },
  }
}

export async function generateDailyContent(lessonId: string, plan?: string, language?: string): Promise<void> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { curriculum: { include: { event: { include: { materials: true } } } } },
  })

  if (!lesson || !lesson.curriculum) return

  // Fold in any user material that overlaps this lesson's topic
  const materialNotes = (lesson.curriculum.event.materials || [])
    .slice(0, 5)
    .map(m => {
      let ex: { summary?: string } = {}
      try { ex = JSON.parse(m.extractedContent || '{}') } catch {}
      return ex.summary ? `Reference "${m.name}": ${ex.summary.slice(0, 300)}` : null
    })
    .filter(Boolean)
    .join('\n')

  const context = lesson.curriculum.event.description +
    (materialNotes ? `\n\nUser-provided reference material (use its specifics where relevant):\n${materialNotes}` : '') +
    languageDirective(language)

  const content = await generateLessonContent(
    lesson.title,
    lesson.type,
    lesson.duration,
    lesson.difficulty,
    context,
    { userId: lesson.curriculum.event.userId, userPlan: plan }
  )

  await prisma.lesson.update({
    where: { id: lessonId },
    data: { content: content as object },
  })

  // Quiz questions must exist as Quiz rows — the quiz UI reads the relation
  // and answer attempts reference a quizId. Content JSON alone renders empty.
  if (content.quiz?.length) {
    const existing = await prisma.quiz.count({ where: { lessonId } })
    if (existing === 0) {
      const VALID_TYPES = ['MCQ', 'FREE_RESPONSE', 'TRUE_FALSE', 'CODE', 'SCENARIO'] as const
      await prisma.quiz.createMany({
        data: content.quiz.map(q => {
          const rawType = String(q.type || 'MCQ').toUpperCase().replace(/[\s-]/g, '_')
          const type = (VALID_TYPES as readonly string[]).includes(rawType) ? rawType : 'MCQ'
          return {
            lessonId,
            question: q.question,
            type: type as (typeof VALID_TYPES)[number],
            options: q.options ?? undefined,
            correctAnswer: String(q.correctAnswer ?? ''),
            explanation: q.explanation || null,
            difficulty: Math.min(5, Math.max(1, Number(q.difficulty) || 3)),
            tags: q.tags || [],
          }
        }),
      })
    }
  }
}
