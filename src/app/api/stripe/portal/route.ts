import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPortalSession, getOrCreateCustomer } from '@/lib/stripe'

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Payments are not yet enabled.', success: false }, { status: 503 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const customerId = await getOrCreateCustomer(user)
  // Prefer the origin the user is actually on — env can lag behind domains
  const appUrl = req.headers.get('origin')
    || (req.headers.get('host') ? `https://${req.headers.get('host')}` : null)
    || process.env.NEXT_PUBLIC_APP_URL
    || 'http://localhost:3000'
  const portalSession = await createPortalSession(customerId, `${appUrl}/billing`)

  return NextResponse.json({ data: { url: portalSession.url }, success: true })
}
