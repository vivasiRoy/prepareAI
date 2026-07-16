import Anthropic from '@anthropic-ai/sdk'
import type { LLMRequestOptions, LLMResponse } from '@/types'
import { estimateCost } from './providers'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Opus 4.7+, Sonnet 5, and Fable 5 reject sampling params (temperature/top_p)
// with a 400 — only send temperature to models that still accept it.
function acceptsTemperature(model: string): boolean {
  return !/opus-4-[78]|sonnet-5|fable/.test(model)
}

export async function callAnthropic(options: LLMRequestOptions): Promise<LLMResponse> {
  const model = options.model || process.env.DEFAULT_MODEL || 'claude-sonnet-4-6'
  const maxTokens = options.maxTokens || 4096

  const messages = options.messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  const systemContent = options.systemPrompt ||
    options.messages.find(m => m.role === 'system')?.content ||
    'You are a helpful AI assistant.'

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    ...(acceptsTemperature(model) ? { temperature: options.temperature ?? 0.7 } : {}),
    system: systemContent,
    messages,
  })

  const inputTokens = response.usage.input_tokens
  const outputTokens = response.usage.output_tokens
  const content = response.content[0].type === 'text' ? response.content[0].text : ''

  return {
    content,
    inputTokens,
    outputTokens,
    model,
    provider: 'anthropic',
    costUsd: estimateCost('anthropic', model, inputTokens, outputTokens),
  }
}

export async function streamAnthropic(options: LLMRequestOptions): Promise<ReadableStream> {
  const model = options.model || process.env.DEFAULT_MODEL || 'claude-sonnet-4-6'
  const maxTokens = options.maxTokens || 4096

  const messages = options.messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  const systemContent = options.systemPrompt ||
    options.messages.find(m => m.role === 'system')?.content ||
    'You are a helpful AI assistant.'

  const stream = await client.messages.stream({
    model,
    max_tokens: maxTokens,
    system: systemContent,
    messages,
  })

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })
}
