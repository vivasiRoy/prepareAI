import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as { redis: Redis }

function createRedisClient(): Redis {
  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    // Fail fast: if Redis is unreachable, requests must not stall behind the
    // offline queue — every caller has a graceful "allow" fallback.
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    enableOfflineQueue: false,
    lazyConnect: true,
    retryStrategy: (times) => Math.min(times * 500, 5000),
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
    // Hard 1.5s ceiling — a slow/unreachable Redis must never stall a request.
    const result = await Promise.race([
      (async () => {
        const current = await redis.incr(key)
        if (current === 1) await redis.expire(key, windowSecs)
        const ttl = await redis.ttl(key)
        const remaining = Math.max(0, limit - current)
        return { allowed: current <= limit, remaining, resetIn: ttl }
      })(),
      new Promise<null>(resolve => setTimeout(() => resolve(null), 1500)),
    ])
    if (result) return result
  } catch {}
  return { allowed: true, remaining: limit, resetIn: windowSecs }
}
