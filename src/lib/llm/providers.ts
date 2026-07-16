import { prisma } from '@/lib/prisma'
import type { LLMRequestOptions, LLMResponse, LLMProvider } from '@/types'
import { callAnthropic } from './anthropic'
import { callOpenAI } from './openai'

export { callAnthropic, callOpenAI }

// ─── Per-plan limits ────────────────────────────────────────────────────────
// The MONTHLY token/cost caps are the real profitability guardrails. The
// per-request cap only prevents a single runaway request — it must stay high
// enough that legitimate features (curriculum outline, lesson content) aren't
// truncated mid-JSON.
//
// FREE runs on Haiku 4.5 ($1/M in, $5/M out) → cost cap $1.00 ≈ one full
// curriculum + a few mock exams. PRO runs on Sonnet 4.6 ($3/$15). ENTERPRISE
// runs on Opus 4.8 ($5/$25).
const PLAN_LIMITS = {
  FREE: {
    monthlyTokens: 400_000,
    monthlyRequests: 80,
    monthlyCostUsd: 1.00,
    maxTokensPerRequest: 6_000,
  },
  PRO: {
    monthlyTokens: 2_000_000,
    monthlyRequests: 500,
    monthlyCostUsd: 5.00,
    maxTokensPerRequest: 8_000,
  },
  ENTERPRISE: {
    monthlyTokens: 6_000_000,
    monthlyRequests: 2_000,
    monthlyCostUsd: 15.00,
    maxTokensPerRequest: 8_000,
  },
} as const

export function getCurrentProvider(): LLMProvider {
  const provider = process.env.DEFAULT_LLM_PROVIDER as LLMProvider
  return provider === 'openai' ? 'openai' : 'anthropic'
}

export function getModelForPlan(plan: string, provider: LLMProvider = 'anthropic'): string {
  if (provider === 'anthropic') {
    if (plan === 'ENTERPRISE') return 'claude-opus-4-8'
    if (plan === 'PRO') return 'claude-sonnet-4-6'
    return 'claude-haiku-4-5-20251001'
  } else {
    if (plan === 'ENTERPRISE') return 'gpt-4o'
    if (plan === 'PRO') return 'gpt-4.1'
    return 'gpt-4.1-mini'
  }
}

export function estimateCost(provider: LLMProvider, model: string, inputTokens: number, outputTokens: number): number {
  // $ per million tokens — keep in sync with https://platform.claude.com/docs/en/pricing
  const pricing: Record<string, { input: number; output: number }> = {
    'claude-haiku-4-5': { input: 1, output: 5 },
    'claude-haiku-4-5-20251001': { input: 1, output: 5 },
    'claude-sonnet-4-5-20250929': { input: 3, output: 15 },
    'claude-sonnet-4-6': { input: 3, output: 15 },
    'claude-sonnet-5': { input: 3, output: 15 },
    'claude-opus-4-8': { input: 5, output: 25 },
    'gpt-4.1-mini': { input: 0.15, output: 0.6 },
    'gpt-4.1': { input: 2, output: 8 },
    'gpt-4o': { input: 2.5, output: 10 },
  }
  const rates = pricing[model] || { input: 5, output: 25 }
  return (inputTokens / 1_000_000) * rates.input + (outputTokens / 1_000_000) * rates.output
}

async function checkUsageLimits(userId: string, plan: string): Promise<void> {
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.FREE

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const usage = await prisma.lLMUsageLog.aggregate({
    where: { userId, createdAt: { gte: startOfMonth } },
    _sum: { inputTokens: true, outputTokens: true, costUsd: true },
    _count: { _all: true },
  })

  const totalTokens = (usage._sum.inputTokens ?? 0) + (usage._sum.outputTokens ?? 0)
  const totalCost = usage._sum.costUsd ?? 0
  const totalRequests = usage._count._all

  if (totalRequests >= limits.monthlyRequests) {
    throw new Error(
      `You have reached the ${limits.monthlyRequests} request limit for your ${plan} plan this month. ` +
      `Upgrade to continue using AI features.`
    )
  }
  if (totalTokens >= limits.monthlyTokens) {
    throw new Error(
      `You have reached the monthly AI usage limit for your ${plan} plan. ` +
      `Upgrade to continue.`
    )
  }
  if (totalCost >= limits.monthlyCostUsd) {
    throw new Error(
      `Monthly AI budget exceeded for your ${plan} plan. Upgrade for higher limits.`
    )
  }
}

export async function generateLLMResponse(options: LLMRequestOptions): Promise<LLMResponse> {
  const provider = options.provider || getCurrentProvider()
  const startTime = Date.now()

  // Enforce per-plan limits for authenticated users
  if (options.userId && options.userPlan) {
    await checkUsageLimits(options.userId, options.userPlan)
  }

  // Cap maxTokens to plan limit
  const planLimits = PLAN_LIMITS[(options.userPlan as keyof typeof PLAN_LIMITS) ?? 'FREE'] ?? PLAN_LIMITS.FREE
  const effectiveMaxTokens = Math.min(
    options.maxTokens ?? planLimits.maxTokensPerRequest,
    planLimits.maxTokensPerRequest
  )

  // Auto-select the model by plan when the caller didn't pin one explicitly.
  // FREE → Haiku (cheap/fast), PRO → Sonnet, ENTERPRISE → Opus. This keeps
  // per-user AI cost aligned with the plan price.
  const effectiveModel = options.model || (options.userPlan ? getModelForPlan(options.userPlan, provider) : undefined)

  let response: LLMResponse
  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {
    try {
      if (provider === 'anthropic') {
        response = await callAnthropic({ ...options, model: effectiveModel, maxTokens: effectiveMaxTokens })
      } else {
        response = await callOpenAI({ ...options, model: effectiveModel, maxTokens: effectiveMaxTokens })
      }

      const latencyMs = Date.now() - startTime

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
      }).catch(() => {})

      return response
    } catch (error) {
      // Don't retry usage limit errors
      if (error instanceof Error && error.message.includes('limit')) throw error
      attempts++
      if (attempts >= maxAttempts) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
    }
  }

  throw new Error('LLM request failed after max retries')
}
