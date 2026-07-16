import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { processDocument } from '@/lib/engine/contentGenerator'
import { PLAN_FEATURES } from '@/types'

const ALLOWED_TYPES = ['text/plain', 'text/markdown', 'text/csv']
const MAX_SIZE = 10 * 1024 * 1024

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!PLAN_FEATURES[session.user.plan].documentUploads) {
    return NextResponse.json({ error: 'Document uploads require Pro plan', success: false }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const eventId = formData.get('eventId') as string | null

  if (!file || !eventId) return NextResponse.json({ error: 'File and eventId required', success: false }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 10MB)', success: false }, { status: 400 })
  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type. Upload plain text, markdown, or CSV.', success: false }, { status: 400 })
  }

  const event = await prisma.event.findFirst({ where: { id: eventId, userId: session.user.id } })
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  // Content is stored in the DB, not on disk — the serverless filesystem is
  // read-only and doesn't persist between instances.
  const buffer = Buffer.from(await file.arrayBuffer())
  const textContent = buffer.toString('utf-8').slice(0, 20000)
  const extracted = await processDocument(textContent, file.name, { userId: session.user.id, userPlan: session.user.plan })

  const material = await prisma.eventMaterial.create({
    data: {
      eventId,
      type: 'DOCUMENT',
      name: file.name,
      content: textContent.slice(0, 10000),
      extractedContent: JSON.stringify(extracted),
      processed: true,
    },
  })

  return NextResponse.json({ data: { material, extracted }, success: true }, { status: 201 })
}
