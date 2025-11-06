import Redis from "ioredis";
import { env } from "../env";

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (_redis) return _redis;
  _redis = new Redis(env.REDIS_URL, {
    lazyConnect: false,
    maxRetriesPerRequest: 3,
  });
  return _redis;
}