import Redis from 'ioredis'
import { config } from './env'

let redis: Redis | null = null

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(config.redisUrl, { lazyConnect: true, enableOfflineQueue: false })
    redis.on('error', (err) => console.warn('[Redis] Error:', err.message))
  }
  return redis
}

export async function setCache(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  try {
    await getRedis().setex(key, ttlSeconds, JSON.stringify(value))
  } catch {}
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const val = await getRedis().get(key)
    return val ? JSON.parse(val) : null
  } catch { return null }
}

export async function delCache(key: string): Promise<void> {
  try { await getRedis().del(key) } catch {}
}
