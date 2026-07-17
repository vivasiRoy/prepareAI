import { NextAuthOptions, getServerSession as nextGetServerSession } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { Role, Plan } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any) as NextAuthOptions['adapter'],
  session: { strategy: 'jwt' },
  pages: { signIn: '/signin' },
  // Firebase Hosting strips ALL cookies except one named `__session` before
  // forwarding requests to the Cloud Function (to keep the CDN cacheable). So
  // the NextAuth session cookie MUST be named `__session`, otherwise it is
  // dropped on GET requests and the server never sees the logged-in session.
  cookies: {
    sessionToken: {
      name: '__session',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
      },
    },
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })] : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? [GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })] : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        // Sign-in only verifies existing accounts. Account creation goes
        // through POST /api/auth/register — auto-creating here would let
        // anyone claim an arbitrary email address on first sign-in.
        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user?.password) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return user
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
      }
      // Refresh role/plan from the DB at most every 30s (and on session
      // update). Without this, a Stripe upgrade wouldn't reach the JWT until
      // the user signed out and back in, so plan limits would still apply.
      const refreshedAt = (token.planRefreshedAt as number) || 0
      if (user || trigger === 'update' || Date.now() - refreshedAt > 30_000) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, plan: true, language: true },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.plan = dbUser.plan
          token.language = dbUser.language
        }
        token.planRefreshedAt = Date.now()
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        session.user.plan = token.plan as Plan
        session.user.language = (token.language as string) || 'en'
      }
      return session
    },
  },
}

export async function getServerSession() {
  return nextGetServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getServerSession()
  if (!session?.user) {
    throw new Error('UNAUTHORIZED')
  }
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  if (session.user.role !== 'ADMIN') {
    throw new Error('FORBIDDEN')
  }
  return session
}

// Extend next-auth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: Role
      plan: Plan
      language: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
    plan: Plan
    language?: string
    planRefreshedAt?: number
  }
}
