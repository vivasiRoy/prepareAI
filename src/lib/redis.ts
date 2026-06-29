import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as { redis: Redis }

function createRedisClient(): Redis {
  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  })
  client.on('error', (err) => console.error('[Redis]', err.message))
  return client
}

export const redis = globalForRedis.redis || createRedisClient()
if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

export async function redisGet<T>(key: string): Promise<T | null> {
  try {
    const val = await redis.get(key)
    if (!val) return null
    return JSON.parse(val) as T
  } catch {
    return null
  }
}

export async function redisSet(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  try {
    const str = JSON.stringify(value)
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, str)
    } else {
      await redis.set(key, str)
    }
  } catch {}
}

export async function redisDel(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch {}
}

export async function getRateLimit(
  userId: string,
  feature: string,
  limit: number,
  windowSecs: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const key = "rl:" + userId + ":" + feature
  try {
    const current = await redis.incr(key)
    if (current === 1) await redis.expire(key, windowSecs)
    const ttl = await redis.ttl(key)
    const remaining = Math.max(0, limit - current)
    return { allowed: current <= limit, remaining, resetIn: ttl }
  } catch {
    return { allowed: true, remaining: limit, resetIn: windowSecs }
  }
}
