import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { storeResult } from "../../../lib/results";
import { testRead, testWrite } from "../../../lib/tests";

const redis = Redis.fromEnv();
const byteSizes = { "1kb": 1024, "10kb": 1024 * 10, "50kb": 1024 * 50 };

async function handler(req: NextRequest) {
  try {
    for (const [size, bytes] of Object.entries(byteSizes)) {
      const now = Date.now();
      const key = `test:${crypto.randomUUID()}`;
      const buf = new Uint8Array(bytes);
      crypto.getRandomValues(buf);

      const writeLatency = await testWrite(redis, key, buf.toString());
      const readLatency = await testRead(redis, key);

      const tc = {
        platform: "vercel-edge",
        region: (req.headers.get("x-vercel-id") ?? "N/A").split("::")[0],
        bytes: "1024",
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

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      error: (err as Error).message,
    }, { status: 500 });
  }
}
export default handler;

export const config = {
  runtime: "experimental-edge",
};
