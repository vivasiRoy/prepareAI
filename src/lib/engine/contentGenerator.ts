import { generateLLMResponse } from '@/lib/llm/providers'
import type { EventType, LessonType, QuizType } from '@prisma/client'
import type { FlashCard, GeneratedQuiz, GeneratedLessonContent } from '@/types'

export async function generateFlashCards(
  topic: string,
  count: number = 10,
  difficulty: number = 3,
  context?: string
): Promise<FlashCard[]> {
  const response = await generateLLMResponse({
    feature: 'flashcard_generation',
    systemPrompt: 'You are an expert educator. Generate flashcards as a JSON array.',
    messages: [{
      role: 'user',
      content: "Generate " + count + " flashcards for topic: “" + topic + "”\nDifficulty: " + difficulty + "/5\n" + (context ? "Context: " + context : "") + "\n\nReturn JSON array: [{front: string, back: string, hint?: string}]",
    }],
    maxTokens: 3000,
    temperature: 0.7,
  })

  try {
    const match = response.content.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
  } catch {}
  return []
}

export async function generateQuiz(
  topic: string,
  type: QuizType = 'MCQ',
  count: number = 5,
  difficulty: number = 3,
  context?: string
): Promise<GeneratedQuiz[]> {
  const typeInstructions = {
    MCQ: 'Multiple choice with 4 options. Mark correctAnswer as the exact option text.',
    FREE_RESPONSE: 'Open-ended questions. correctAnswer should be a model answer.',
    TRUE_FALSE: 'True/false statements. correctAnswer is "True" or "False".',
    CODE: 'Coding challenges. correctAnswer is working code.',
    SCENARIO: 'Scenario-based questions requiring applied thinking.',
  }

  const response = await generateLLMResponse({
    feature: 'quiz_generation',
    systemPrompt: 'You are an expert question designer. Return valid JSON only.',
    messages: [{
      role: 'user',
      content: "Generate " + count + " " + type + " questions for: “" + topic + "”\nDifficulty: " + difficulty + "/5\nType guide: " + typeInstructions[type] + "\n" + (context || '') + "\n\nReturn JSON array: [{question, type, options?: string[], correctAnswer, explanation, difficulty, tags: string[]}]",
    }],
    maxTokens: 4000,
    temperature: 0.7,
  })

  try {
    const match = response.content.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
  } catch {}
  return []
}

export async function generateLessonContent(
  topic: string,
  type: LessonType,
  duration: number,
  difficulty: number,
  context?: string
): Promise<GeneratedLessonContent> {
  const response = await generateLLMResponse({
    feature: 'lesson_generation',
    systemPrompt: 'You are an expert instructional designer. Create engaging, practical lesson content.',
    messages: [{
      role: 'user',
      content: "Create a " + duration + "-minute " + type.replace('_', ' ').toLowerCase() + " lesson about: “" + topic + "”\nDifficulty: " + difficulty + "/5\n" + (context || '') + "\n\nReturn JSON: {summary, keyPoints: string[], examples: string[], flashcards?: [{front, back, hint?}], quiz?: [{question, type, options?, correctAnswer, explanation, difficulty}], simulationContext?, evaluationCriteria?: string[]}",
    }],
    maxTokens: 5000,
    temperature: 0.8,
  })

  try {
    const match = response.content.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
  } catch {}

  return {
    summary: 'Content for ' + topic,
    keyPoints: ['Key concept 1', 'Key concept 2', 'Key concept 3'],
    examples: ['Example 1', 'Example 2'],
  }
}

export async function generateSimulation(
  eventType: EventType,
  scenario: string,
  difficulty: number = 3
): Promise<{ scenario: string; context: string; evaluationCriteria: string[]; idealResponse: string }> {
  const response = await generateLLMResponse({
    feature: 'simulation_generation',
    systemPrompt: 'You create realistic practice simulations for high-stakes events.',
    messages: [{
      role: 'user',
      content: "Create a simulation for: " + eventType + "\nScenario theme: " + scenario + "\nDifficulty: " + difficulty + "/5\n\nReturn JSON: {scenario, context, evaluationCriteria: string[], idealResponse}",
    }],
    maxTokens: 2000,
    temperature: 0.8,
  })

  try {
    const match = response.content.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
  } catch {}

  return {
    scenario,
    context: 'You are in a ' + eventType.toLowerCase().replace('_', ' ') + ' situation.',
    evaluationCriteria: ['Clarity', 'Relevance', 'Confidence'],
    idealResponse: '',
  }
}

export async function processDocument(
  content: string,
  materialName: string
): Promise<{ summary: string; keyPoints: string[]; topics: string[]; questions: string[] }> {
  const truncated = content.slice(0, 8000)

  const response = await generateLLMResponse({
    feature: 'document_processing',
    systemPrompt: 'Extract key learning information from documents.',
    messages: [{
      role: 'user',
      content: "Extract learning content from this document: “" + materialName + "”\n\n" + truncated + "\n\nReturn JSON: {summary, keyPoints: string[], topics: string[], questions: string[]}",
    }],
    maxTokens: 3000,
    temperature: 0.3,
  })

  try {
    const match = response.content.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
  } catch {}

  return {
    summary: 'Processed document: ' + materialName,
    keyPoints: [],
    topics: [],
    questions: [],
  }
}
