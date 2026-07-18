import { PrismaClient } from '@/generated/prisma'
import { withAccelerate } from '@prisma/extension-accelerate'

// Prisma Accelerate: the client talks to the Accelerate proxy over HTTP using
// the `prisma://` DATABASE_URL, so no query engine binary is needed at runtime.
// This is what makes Prisma work reliably on Firebase Cloud Functions / Cloud
// Run, where bundling or generating the native engine is unreliable.
//
// The runtime client is extended with withAccelerate(), but we type the export
// as PrismaClient so standard query result types flow through the app (we don't
// use Accelerate's cacheStrategy API).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrismaClient(): PrismaClient {
  return new PrismaClient().$extends(withAccelerate()) as unknown as PrismaClient
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
