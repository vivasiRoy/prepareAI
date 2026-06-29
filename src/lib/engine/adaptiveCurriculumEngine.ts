import { generateLLMResponse } from '@/lib/llm/providers'
import { classifyEvent } from './domainClassifier'
import { generateLessonContent } from './contentGenerator'
import { getDomainTemplate } from '@/templates/domains'
import { prisma } from '@/lib/prisma'
import type { EventWithRelations, GeneratedLesson } from '@/types'
import type { LessonType, Plan } from '@prisma/client'

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
}): Promise<{ lessons: GeneratedLesson[]; outline: object; skillTree: object; domainContext: object }> {
  const { event, userId } = params

  const totalDays = calculateDaysUntil(event.targetDate)
  const template = getDomainTemplate(event.type, event.description)
  const domain = await classifyEvent(event.description, event.type, event.goalOutcome)

  const outlinePrompt = "Create a " + totalDays + "-day preparation curriculum for:\nEvent: " + event.title + " (" + event.type + ")\nGoal: " + event.goalOutcome + "\nKey skills needed: " + domain.keySkills.join(', ') + "\nCore topics: " + domain.coreTopics.join(', ') + "\n\nReturn JSON with: {dailyTopics: [{day: number, topic: string, focus: string, lessonType: string, duration: number, difficulty: number}], skillTree: {nodes: [{id, name, prerequisites: []}]}, weeklyMilestones: [{week, milestone}]}"

  const outlineResponse = await generateLLMResponse({
    feature: 'curriculum_generation',
    userId,
    systemPrompt: 'You are an expert learning designer creating adaptive curricula.',
    messages: [{ role: 'user', content: outlinePrompt }],
    maxTokens: 6000,
    temperature: 0.7,
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
    const match = outlineResponse.content.match(/\{[\s\S]*\}/)
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

  // Generate detailed content for first 5 days immediately; rest is lazy-loaded
  const lessons: GeneratedLesson[] = []
  const daysToGenerate = Math.min(5, outline.dailyTopics.length)

  for (let i = 0; i < daysToGenerate; i++) {
    const dayInfo = outline.dailyTopics[i]
    const content = await generateLessonContent(
      dayInfo.topic,
      (dayInfo.lessonType as LessonType) || 'MICRO_LESSON',
      dayInfo.duration || 20,
      dayInfo.difficulty || 3,
      event.description
    )

    lessons.push({
      dayNumber: dayInfo.day,
      title: dayInfo.topic,
      type: (dayInfo.lessonType as LessonType) || 'MICRO_LESSON',
      content,
      duration: dayInfo.duration || 20,
      difficulty: dayInfo.difficulty || 3,
      order: i,
    })
  }

  // Stub remaining days
  for (let i = daysToGenerate; i < outline.dailyTopics.length; i++) {
    const dayInfo = outline.dailyTopics[i]
    lessons.push({
      dayNumber: dayInfo.day,
      title: dayInfo.topic,
      type: (dayInfo.lessonType as LessonType) || 'MICRO_LESSON',
      content: { summary: '', keyPoints: [], examples: [] },
      duration: dayInfo.duration || 20,
      difficulty: dayInfo.difficulty || 3,
      order: i,
    })
  }

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

export async function generateDailyContent(lessonId: string): Promise<void> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { curriculum: { include: { event: true } } },
  })

  if (!lesson || !lesson.curriculum) return

  const content = await generateLessonContent(
    lesson.title,
    lesson.type,
    lesson.duration,
    lesson.difficulty,
    lesson.curriculum.event.description
  )

  await prisma.lesson.update({
    where: { id: lessonId },
    data: { content: content as object },
  })
}
