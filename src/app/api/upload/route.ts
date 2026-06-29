import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { processDocument } from '@/lib/engine/contentGenerator'
import { PLAN_FEATURES } from '@/types'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const ALLOWED_TYPES = ['application/pdf', 'text/plain', 'text/markdown']
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

  const event = await prisma.event.findFirst({ where: { id: eventId, userId: session.user.id } })
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const uploadDir = join(process.cwd(), 'public', 'uploads', session.user.id)
  await mkdir(uploadDir, { recursive: true })
  const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, '_')}`
  const filepath = join(uploadDir, filename)
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filepath, buffer)

  const textContent = buffer.toString('utf-8').slice(0, 20000)
  const extracted = await processDocument(textContent, file.name)

  const material = await prisma.eventMaterial.create({
    data: {
      eventId,
      type: 'DOCUMENT',
      name: file.name,
      url: `/uploads/${session.user.id}/${filename}`,
      content: textContent.slice(0, 10000),
      extractedContent: JSON.stringify(extracted),
      processed: true,
    },
  })

  return NextResponse.json({ data: { material, extracted }, success: true }, { status: 201 })
}
