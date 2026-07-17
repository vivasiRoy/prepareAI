import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Database connection — two modes:
//
// 1. NEON_DATABASE_URL set → Neon serverless driver adapter. Traffic flows
//    over HTTPS/WebSockets (port 443), no query engine binary, no Accelerate
//    dependency. This is the failover path introduced during the 2026-07-17
//    Prisma Accelerate outage, and works identically in dev and on Firebase.
//
// 2. Otherwise → Prisma Accelerate via the `prisma://` DATABASE_URL (the
//    engineless client speaks HTTP to the Accelerate proxy).
//
// Either way the export is typed as PrismaClient so query result types flow
// through the app unchanged (we don't use Accelerate's cacheStrategy API).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrismaClient(): PrismaClient {
  // Failover is a protocol switch on DATABASE_URL:
  //   prisma+postgres:// or prisma://  → Accelerate (engineless HTTP proxy)
  //   postgres(ql)://                  → Neon serverless adapter over ws/443
  // NEON_DATABASE_URL, when set, takes precedence and forces adapter mode.
  const neonUrl = process.env.NEON_DATABASE_URL
    || (process.env.DATABASE_URL?.startsWith('postgres') ? process.env.DATABASE_URL : undefined)
  if (neonUrl) {
    if (typeof WebSocket === 'undefined') neonConfig.webSocketConstructor = ws
    const adapter = new PrismaNeon({ connectionString: neonUrl })
    return new PrismaClient({ adapter } as any) as unknown as PrismaClient
  }
  return new PrismaClient().$extends(withAccelerate()) as unknown as PrismaClient
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
