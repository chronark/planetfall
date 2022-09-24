import { Redis } from "@upstash/redis";
import { NextApiRequest, NextApiResponse } from "next";

const redis = Redis.fromEnv();
/**
 * Entry point for running tests, we just call this endpoint and it will take care of triggering all tests
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const host = process.env.VERCEL_URL ?? "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";

    await Promise.all([
      fetch(`${protocol}://${host}/api/test/serverless`),
      fetch(`${protocol}://${host}/api/test/edge`),
      fetch("https://upstash-latency.upstash.workers.dev/test"),
    ]);

    /**
     * Compact all results to last 24h
     */

    let keys: string[] = [];
    let cursor = 0;
    while (true) {
      const [newCursor, found] = await redis.scan(cursor, {
        match: "results:*",
      });
      keys.push(...found);
      if (newCursor > 0) {
        cursor = newCursor;
      } else {
        break;
      }
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send((err as Error).message);
  } finally {
    res.end();
  }
}
export default handler;
