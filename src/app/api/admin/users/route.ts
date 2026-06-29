import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const plan = searchParams.get('plan') || undefined

  const where: Record<string, any> = {}
  if (search) where.OR = [
    { name: { contains: search, mode: 'insensitive' } },
    { email: { contains: search, mode: 'insensitive' } },
  ]
  if (plan) where.plan = plan

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, image: true, plan: true, role: true, createdAt: true,
        _count: { select: { events: true } },
        subscription: { select: { status: true, currentPeriodEnd: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({ data: { items: users, total, page, limit, hasMore: page * limit < total }, success: true })
}

export async function PATCH(req: Request) {
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  const { userId, plan, role } = await req.json()

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { ...(plan && { plan }), ...(role && { role }) },
    select: { id: true, email: true, plan: true, role: true },
  })

  return NextResponse.json({ data: updated, success: true })
}
