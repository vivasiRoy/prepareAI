import { prisma } from '@/lib/prisma'
import type { LLMRequestOptions, LLMResponse, LLMProvider } from '@/types'
import { callAnthropic } from './anthropic'
import { callOpenAI } from './openai'

export { callAnthropic, callOpenAI }

export function getCurrentProvider(): LLMProvider {
  const provider = process.env.DEFAULT_LLM_PROVIDER as LLMProvider
  return provider === 'openai' ? 'openai' : 'anthropic'
}

export function getModelForPlan(plan: string, provider: LLMProvider = 'anthropic'): string {
  if (provider === 'anthropic') {
    if (plan === 'ENTERPRISE') return 'claude-opus-4-8'
    if (plan === 'PRO') return 'claude-sonnet-4-5-20251001'
    return 'claude-haiku-4-5-20251001'
  } else {
    if (plan === 'ENTERPRISE') return 'gpt-4o'
    if (plan === 'PRO') return 'gpt-4.1'
    return 'gpt-4.1-mini'
  }
}

export function estimateCost(provider: LLMProvider, model: string, inputTokens: number, outputTokens: number): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'claude-haiku-4-5-20251001': { input: 0.25, output: 1.25 },
    'claude-sonnet-4-5-20251001': { input: 3, output: 15 },
    'claude-opus-4-8': { input: 15, output: 75 },
    'gpt-4.1-mini': { input: 0.15, output: 0.6 },
    'gpt-4.1': { input: 2, output: 8 },
    'gpt-4o': { input: 2.5, output: 10 },
  }
  const rates = pricing[model] || { input: 3, output: 15 }
  return (inputTokens / 1_000_000) * rates.input + (outputTokens / 1_000_000) * rates.output
}

export async function generateLLMResponse(options: LLMRequestOptions): Promise<LLMResponse> {
  const provider = options.provider || getCurrentProvider()
  const startTime = Date.now()

  let response: LLMResponse
  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {
    try {
      if (provider === 'anthropic') {
        response = await callAnthropic(options)
      } else {
        response = await callOpenAI(options)
      }

      const latencyMs = Date.now() - startTime

      // Log usage asynchronously
      prisma.lLMUsageLog.create({
        data: {
          userId: options.userId || null,
          provider,
          model: response.model,
          inputTokens: response.inputTokens,
          outputTokens: response.outputTokens,
          costUsd: response.costUsd,
          feature: options.feature || 'unknown',
          latencyMs,
        },
      }).catch(() => {}) // Non-blocking

      return response
    } catch (error) {
      attempts++
      if (attempts >= maxAttempts) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
    }
  }

  throw new Error('LLM request failed after max retries')
}
