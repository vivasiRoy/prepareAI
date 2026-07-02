import OpenAI from 'openai'
import type { LLMRequestOptions, LLMResponse } from '@/types'
import { estimateCost } from './providers'

let _client: OpenAI | null = null
function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY environment variable is not set')
    _client = new OpenAI({ apiKey })
  }
  return _client
}

export async function callOpenAI(options: LLMRequestOptions): Promise<LLMResponse> {
  const client = getClient()
  const model = options.model || 'gpt-4.1'
  const maxTokens = options.maxTokens || 4096
  const temperature = options.temperature ?? 0.7

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []

  const systemPrompt = options.systemPrompt || options.messages.find(m => m.role === 'system')?.content
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }

  messages.push(...options.messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
  )

  const response = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    temperature,
    messages,
  })

  const inputTokens = response.usage?.prompt_tokens || 0
  const outputTokens = response.usage?.completion_tokens || 0
  const content = response.choices[0]?.message?.content || ''

  return {
    content,
    inputTokens,
    outputTokens,
    model,
    provider: 'openai',
    costUsd: estimateCost('openai', model, inputTokens, outputTokens),
  }
}
