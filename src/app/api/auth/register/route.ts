import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  ref: z.string().max(64).optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
    }

    const { name, email, password, ref } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // Referral attribution: only store refs that point at a real, other user
    let referredBy: string | null = null
    if (ref) {
      const referrer = await prisma.user.findUnique({ where: { id: ref }, select: { id: true } })
      if (referrer) referredBy = referrer.id
    }

    const isAdmin = email === process.env.ADMIN_EMAIL
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: isAdmin ? 'ADMIN' : 'USER',
        plan: isAdmin ? 'ENTERPRISE' : 'FREE',
        emailVerified: new Date(),
        referredBy,
      },
      select: { id: true, name: true, email: true, role: true, plan: true },
    })

    return NextResponse.json({ data: user, success: true }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/auth/register]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
