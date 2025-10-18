import Redis from 'ioredis';
import { env } from '../env';

const redis = new Redis(env.REDIS_URL);

const getKey = (monitorId: string) => `processed:monitor:${monitorId}`;

export async function getProcessedIds(monitorId: string): Promise<Set<string>> {
  const ids = await redis.smembers(getKey(monitorId));
  return new Set(ids);
}

export async function addProcessedIds(monitorId: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await redis.sadd(getKey(monitorId), ids);
}
