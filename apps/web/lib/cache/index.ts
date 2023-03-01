import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function withCache<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
  const cacheKey = `cache:${key}`;
  const cached = await redis.get<T>(cacheKey);
  if (cached) {
    console.log("cache hit", key);
    return cached;
  }
  console.log("cache miss", key);
  const data = await fn();
  await redis.set(cacheKey, data, { ex: ttl });
  return data;
}
