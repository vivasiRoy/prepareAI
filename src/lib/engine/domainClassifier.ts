import { generateLLMResponse } from '@/lib/llm/providers'
import { getDomainTemplate } from '@/templates/domains'
import type { EventType } from '@prisma/client'

export interface DomainClassification {
  primaryDomain: string
  subDomains: string[]
  keySkills: string[]
  estimatedDifficulty: number
  recommendedDays: number
  coreTopics: string[]
}

export async function classifyEvent(
  description: string,
  type: EventType,
  goalOutcome: string
): Promise<DomainClassification> {
  const template = getDomainTemplate(type, description)

  try {
    const response = await generateLLMResponse({
      feature: 'domain_classification',
      systemPrompt: 'You are an expert learning designer. Analyze this event and return a JSON object with classification details.',
      messages: [{
        role: 'user',
        content: "Event type: " + type + "\nDescription: " + description + "\nGoal: " + goalOutcome + "\n\nReturn JSON: { primaryDomain, subDomains: [], keySkills: [], estimatedDifficulty: 1-5, recommendedDays: number, coreTopics: [] }",
      }],
      maxTokens: 1000,
      temperature: 0.3,
    })

    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        primaryDomain: parsed.primaryDomain || template.name,
        subDomains: parsed.subDomains || template.coreTopics.slice(0, 3),
        keySkills: parsed.keySkills || template.keySkills,
        estimatedDifficulty: parsed.estimatedDifficulty || 3,
        recommendedDays: parsed.recommendedDays || template.typicalDuration,
        coreTopics: parsed.coreTopics || template.coreTopics,
      }
    }
  } catch {}

  return {
    primaryDomain: template.name,
    subDomains: template.coreTopics.slice(0, 3),
    keySkills: template.keySkills,
    estimatedDifficulty: 3,
    recommendedDays: template.typicalDuration,
    coreTopics: template.coreTopics,
  }
}
