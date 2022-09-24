import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

type TestCase = {
  platform: string | "vercel-serverless" | "vercel-edge" | "cloudflare" | "fly";
  region: string;
  type: "read" | "write";
  size: string;
};

type Result = {
  latency: number;
  ts: number;
};
export async function storeResult(tc: TestCase, result: Result): Promise<void> {
  const key = ["results", tc.platform, tc.type, tc.size, tc.region].join(":");
  await redis.zadd(key, { score: result.ts, member: result });
}

/**
 * Get the results for a test case since a given timestamp.
 */
export async function getResults(
  tc: TestCase,
  opts: { since: number },
): Promise<Result[]> {
  const key = ["results", tc.platform, tc.type, tc.size, tc.region].join(":");
  return await redis.zrange(key, opts.since, "+inf", { byScore: true });
}
