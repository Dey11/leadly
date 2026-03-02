import Redis from "ioredis";
import { env } from "../env";

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (_redis) return _redis;
  _redis = new Redis(env.REDIS_URL, {
    lazyConnect: false,
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    keepAlive: 30000,
    enableReadyCheck: true,
    retryStrategy(times) {
      // Exponential backoff: 50ms, 100ms, 200ms, 400ms... capped at 5s
      return Math.min(50 * 2 ** (times - 1), 5000);
    },
  });
  return _redis;
}

export async function closeRedis(): Promise<void> {
  if (_redis) {
    await _redis.quit();
    _redis = null;
  }
}
