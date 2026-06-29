import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCheckoutSession } from '@/lib/stripe'
import { z } from 'zod'

const schema = z.object({ plan: z.enum(['PRO', 'ENTERPRISE']) })

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid plan', success: false }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const checkoutSession = await createCheckoutSession(
    user,
    parsed.data.plan,
    `${appUrl}/billing?success=true`,
    `${appUrl}/billing?canceled=true`
  )

  return NextResponse.json({ data: { url: checkoutSession.url }, success: true })
}
