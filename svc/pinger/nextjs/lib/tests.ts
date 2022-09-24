import type { Redis } from "@upstash/redis";
/**
 * Test and return the latency of a write operation.
 */
export async function testWrite(
  redis: Redis,
  key: string,
  value: string,
): Promise<number> {
  const start = Date.now();
  await redis.set(key, value, { ex: 60 });
  return Date.now() - start;
}

/**
 * Test and return the latency of a read operation.
 */
export async function testRead(redis: Redis, key: string): Promise<number> {
  const start = Date.now();
  await redis.get(key);
  return Date.now() - start;
}
