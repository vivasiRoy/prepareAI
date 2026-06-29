import { NextAuthOptions, getServerSession as nextGetServerSession } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { Role, Plan } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  session: { strategy: 'jwt' },
  pages: { signIn: '/signin' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user || !user.password) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return user
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, plan: true } })
        token.role = dbUser?.role
        token.plan = dbUser?.plan
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        session.user.plan = token.plan as Plan
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
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
    plan: Plan
  }
}
