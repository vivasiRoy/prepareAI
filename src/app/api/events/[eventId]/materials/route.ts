import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { processDocument } from '@/lib/engine/contentGenerator'
import { z } from 'zod'

const schema = z.object({
  type: z.enum(['URL', 'TEXT']),
  name: z.string().min(1).max(200).optional(),
  url: z.string().url().max(2000).optional(),
  content: z.string().max(50_000).optional(),
})

const YOUTUBE_RE = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchUrlText(url: string): Promise<{ title: string; text: string }> {
  // YouTube pages are JS shells — use oEmbed for reliable title/author metadata.
  const yt = url.match(YOUTUBE_RE)
  if (yt) {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`, {
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) throw new Error('Could not read that YouTube link')
    const meta = await res.json()
    return {
      title: meta.title || 'YouTube video',
      text: `YouTube video: "${meta.title}" by ${meta.author_name}. The user wants this video's subject matter incorporated into their preparation plan. Treat the title as the topic to cover.`,
    }
  }

  const res = await fetch(url, {
    signal: AbortSignal.timeout(10_000),
    headers: { 'User-Agent': 'PrepareAI-MaterialFetcher/1.0' },
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`That page returned ${res.status}`)
  const contentType = res.headers.get('content-type') || ''
  if (!/text\/html|text\/plain|text\/markdown/.test(contentType)) {
    throw new Error('Only web pages and text links are supported')
  }
  const raw = (await res.text()).slice(0, 300_000)
  const titleMatch = raw.match(/<title[^>]*>([^<]*)<\/title>/i)
  const text = stripHtml(raw).slice(0, 20_000)
  if (text.length < 80) throw new Error('Could not extract readable text from that page')
  return { title: titleMatch?.[1]?.trim() || new URL(url).hostname, text }
}

export async function GET(req: Request, { params }: { params: { eventId: string } }) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const materials = await prisma.eventMaterial.findMany({
    where: { eventId: params.eventId, event: { userId: session.user.id } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ data: materials, success: true })
}

export async function POST(req: Request, { params }: { params: { eventId: string } }) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', success: false }, { status: 400 })

  const event = await prisma.event.findFirst({ where: { id: params.eventId, userId: session.user.id } })
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const count = await prisma.eventMaterial.count({ where: { eventId: params.eventId } })
  if (count >= 10) return NextResponse.json({ error: 'Maximum 10 materials per event', success: false }, { status: 400 })

  const { type, url, content, name } = parsed.data
  let text = ''
  let materialName = name || ''

  try {
    if (type === 'URL') {
      if (!url) return NextResponse.json({ error: 'URL required', success: false }, { status: 400 })
      const fetched = await fetchUrlText(url)
      text = fetched.text
      materialName = materialName || fetched.title
    } else {
      if (!content?.trim()) return NextResponse.json({ error: 'Content required', success: false }, { status: 400 })
      text = content.slice(0, 20_000)
      materialName = materialName || 'Pasted notes'
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Could not fetch that link', success: false }, { status: 422 })
  }

  // Distill into study-relevant structure (summary, key points, topics)
  let extracted: object | null = null
  try {
    extracted = await processDocument(text, materialName, { userId: session.user.id, userPlan: session.user.plan })
  } catch {}

  const material = await prisma.eventMaterial.create({
    data: {
      eventId: params.eventId,
      type: type === 'URL' ? 'URL' : 'TEXT',
      name: materialName.slice(0, 200),
      url: url || null,
      content: text.slice(0, 10_000),
      extractedContent: extracted ? JSON.stringify(extracted) : null,
      processed: !!extracted,
    },
  })

  return NextResponse.json({ data: material, success: true }, { status: 201 })
}

export async function DELETE(req: Request, { params }: { params: { eventId: string } }) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required', success: false }, { status: 400 })

  const material = await prisma.eventMaterial.findFirst({
    where: { id, eventId: params.eventId, event: { userId: session.user.id } },
  })
  if (!material) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.eventMaterial.delete({ where: { id } })
  return NextResponse.json({ success: true, data: { id } })
}
