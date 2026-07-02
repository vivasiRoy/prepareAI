import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import { createRequire } from 'module'

neonConfig.webSocketConstructor = ws

const require = createRequire(import.meta.url)
const bcrypt = require('bcryptjs')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()

const res = await client.query('SELECT email, password, role, plan FROM "User" WHERE email = $1', ['demo@prepareai.com'])
if (res.rows.length === 0) {
  console.log('❌ User not found in DB')
} else {
  const user = res.rows[0]
  console.log('✅ User found:', user.email, '| role:', user.role, '| plan:', user.plan)
  console.log('   password hash present:', !!user.password)
  const valid = await bcrypt.compare('demo123!', user.password)
  console.log('   bcrypt.compare("demo123!") =>', valid)
}

client.release()
await pool.end()
