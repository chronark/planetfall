import { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";
import { testRead, testWrite } from "../../../lib/tests";
import crypto from "node:crypto";
import Cors from "cors";
import { rejects } from "node:assert";

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ["POST", "GET", "HEAD"],
});

const redis = Redis.fromEnv();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  cors(req, res, (r) => {
    if (r instanceof Error) {
      throw r;
    }
    return r;
  });

  try {
    const ts = Date.now();
    const key = `test:${crypto.randomUUID()}`;
    const value = crypto.randomUUID();

    const write = await testWrite(redis, key, value);
    const read = await testRead(redis, key);
    return res.status(200).json({
      ts,
      latency: { read, write },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send((err as Error).message);
  } finally {
    res.end();
  }
}
export default handler;
