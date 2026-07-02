import { readFileSync } from 'fs'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

neonConfig.webSocketConstructor = ws

const __dir = dirname(fileURLToPath(import.meta.url))

// Load .env
const envContent = readFileSync(join(__dir, '../.env'), 'utf8').replace(/\r\n/g, '\n')
for (const line of envContent.split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)="?([^"]*)"?$/)
  if (m) process.env[m[1]] = m[2]
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const raw = readFileSync(join(__dir, 'init.sql'), 'utf8')
  .replace(/^﻿/, '') // strip BOM
  .replace(/\r\n/g, '\n')

// Split on the comment markers -- these mark each logical statement boundary
// Split on ';\n\n-- ' pattern which reliably separates Prisma-generated statements
const parts = raw.split(/(?<=;)\n+(?=--|\s*$)/)

const statements = []
for (const part of parts) {
  const cleaned = part.replace(/^--[^\n]*\n/gm, '').trim()
  if (cleaned && cleaned !== ';') statements.push(cleaned)
}

console.log(`Pushing ${statements.length} statements to Neon (skip-on-exists mode)...`)
const client = await pool.connect()
let ok = 0, skipped = 0, failed = 0

for (const stmt of statements) {
  if (!stmt.trim()) continue
  try {
    await client.query(stmt)
    ok++
    const preview = stmt.replace(/\s+/g, ' ').slice(0, 80)
    console.log(`  ✓ ${preview}`)
  } catch (err) {
    const code = err.code
    if (['42P07', '42710', '42P06', '42701'].includes(code) ||
        err.message?.includes('already exists')) {
      skipped++
      console.log(`  ⚠ Already exists (ok)`)
    } else {
      failed++
      console.error(`  ✗ [${code}] ${err.message?.slice(0, 100)}`)
    }
  }
}

client.release()
await pool.end()

console.log(`\n${ok} applied, ${skipped} skipped, ${failed} failed`)
if (failed === 0) {
  console.log('✅ Schema is ready on Neon!')
} else {
  process.exit(1)
}
