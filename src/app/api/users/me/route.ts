import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET() {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, image: true, role: true, plan: true, createdAt: true,
      subscription: true,
      _count: { select: { events: { where: { status: 'ACTIVE' } } } },
    },
  })

  return NextResponse.json({ data: user, success: true })
}

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional(),
})

export async function PATCH(req: Request) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', success: false }, { status: 400 })

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: { id: true, name: true, email: true, image: true, plan: true, role: true },
  })

  return NextResponse.json({ data: user, success: true })
}
