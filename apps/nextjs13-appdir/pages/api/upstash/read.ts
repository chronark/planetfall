import { NextRequest, NextResponse } from "next/server";

import { Redis } from "@upstash/redis"
const redis = Redis.fromEnv()
export default async function handler(_req: NextRequest) {
	return new NextResponse(await redis.srandmember("random-set"));
}

export const config = {
	runtime: "edge",
};
