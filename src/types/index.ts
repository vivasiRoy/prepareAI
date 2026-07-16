import type { User, Event, EventType, EventStatus, Plan, Role, LessonType, QuizType, Attempt, EventMaterial, EventGoal, Curriculum, Lesson, Quiz, PerformanceMetrics, Subscription } from '@/generated/prisma'

export type { User, Event, EventType, EventStatus, Plan, Role, LessonType, QuizType, Attempt, EventMaterial, EventGoal, Curriculum, Lesson, Quiz, PerformanceMetrics, Subscription }

export type EventWithRelations = Event & {
  materials: EventMaterial[]
  curriculum: CurriculumWithLessons | null
  goals: EventGoal[]
  user: Pick<User, 'id' | 'name' | 'email' | 'image'>
  metrics: PerformanceMetrics[]
}

export type CurriculumWithLessons = Curriculum & {
  lessons: LessonWithQuizzes[]
}

export type LessonWithQuizzes = Lesson & {
  quizzes: Quiz[]
  attempts: Attempt[]
}

export type LLMProvider = 'anthropic' | 'openai'

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface LLMRequestOptions {
  provider?: LLMProvider
  model?: string
  messages: LLMMessage[]
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  tools?: unknown[]
  userId?: string
  userPlan?: string
  feature?: string
}

export interface LLMResponse {
  content: string
  inputTokens: number
  outputTokens: number
  model: string
  provider: LLMProvider
  costUsd: number
}

export interface DomainTemplate {
  id: string
  name: string
  eventTypes: EventType[]
  coreTopics: string[]
  learningObjectives: string[]
  keySkills: string[]
  typicalDuration: number
  commonQuestions: string[]
  simulationScenarios: string[]
  weeklyBreakdown: { week: number; focus: string; activities: string[] }[]
}

export interface FlashCard {
  front: string
  back: string
  hint?: string
}

export interface GeneratedQuiz {
  question: string
  type: QuizType
  options?: string[]
  correctAnswer: string
  explanation: string
  difficulty: number
  tags?: string[]
}

export interface GeneratedLessonContent {
  summary: string
  keyPoints: string[]
  examples: string[]
  flashcards?: FlashCard[]
  quiz?: GeneratedQuiz[]
  simulationContext?: string
  evaluationCriteria?: string[]
}

export interface GeneratedLesson {
  dayNumber: number
  title: string
  type: LessonType
  content: GeneratedLessonContent
  duration: number
  difficulty: number
  order: number
}

export interface PerformanceSummary {
  successProbability: number
  streak: number
  topicsStrong: string[]
  topicsWeak: string[]
  nextFocus: string
  daysUntilEvent: number
  accuracyRate: number
  totalAttempts: number
}

export interface AdaptiveRecommendation {
  adjustDifficulty: number
  focusTopics: string[]
  skipTopics: string[]
  estimatedReadiness: number
  suggestedPace: 'slow' | 'normal' | 'accelerate'
}

export interface PlanFeatures {
  maxEvents: number
  dailyAICalls: number
  documentUploads: boolean
  simulations: boolean
  teamDashboard: boolean
  analytics: boolean
  prioritySupport: boolean
}

export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  FREE: {
    maxEvents: 1,
    dailyAICalls: 10,
    documentUploads: false,
    simulations: false,
    teamDashboard: false,
    analytics: false,
    prioritySupport: false,
  },
  PRO: {
    maxEvents: 999,
    dailyAICalls: 999,
    documentUploads: true,
    simulations: true,
    teamDashboard: false,
    analytics: true,
    prioritySupport: true,
  },
  ENTERPRISE: {
    maxEvents: 9999,
    dailyAICalls: 9999,
    documentUploads: true,
    simulations: true,
    teamDashboard: true,
    analytics: true,
    prioritySupport: true,
  },
}

export type ApiResponse<T> =
  | { data: T; success: true }
  | { error: string; success: false }

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
