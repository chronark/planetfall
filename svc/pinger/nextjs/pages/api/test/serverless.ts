import { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";
import { storeResult } from "../../../lib/results";
import { testRead, testWrite } from "../../../lib/tests";
import crypto from "node:crypto";

const redis = Redis.fromEnv({ automaticDeserialization: false });
const byteSizes = { "1kb": 1024, "10kb": 1024 * 10, "50kb": 1024 * 50 };

async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    for (const [size, bytes] of Object.entries(byteSizes)) {
      const now = Date.now();
      const key = `test:${crypto.randomUUID()}`;
      const buf = crypto.randomBytes(bytes);

      const writeLatency = await testWrite(redis, key, buf.toString("base64"));
      const readLatency = await testRead(redis, key);
      const tc = {
        platform: "vercel-serverless",
        region: process.env.VERCEL_REGION ?? "none",
      };

      await storeResult({ ...tc, type: "write", size }, {
        latency: writeLatency,
        ts: now,
      });
      await storeResult({ ...tc, type: "read", size }, {
        latency: readLatency,
        ts: now,
      });
    }

    return res.status(200).json({
      ok: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send((err as Error).message);
  } finally {
    res.end();
  }
}
export default handler;
