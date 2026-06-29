import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPortalSession, getOrCreateCustomer } from '@/lib/stripe'

export async function POST() {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const customerId = await getOrCreateCustomer(user)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const portalSession = await createPortalSession(customerId, `${appUrl}/billing`)

  return NextResponse.json({ data: { url: portalSession.url }, success: true })
}
