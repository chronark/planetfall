import { withMethods, withMiddleware, withRecoverer } from "lib/api";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { ApiError } from "lib/api/error";
import type { ApiResponse } from "lib/api/response";
import { Redis } from "@upstash/redis";
import { newShortId } from "@planetfall/id";

const redis = Redis.fromEnv();

const input = z.object({
	method: z.enum(["POST"]),
	headers: z.object({
		"content-type": z.enum(["application/json"]),
	}),
	body: z.object({
		url: z.string().url(),
		checks: z.array(
			z.object({
				region: z.object({
					id: z.string(),
					name: z.string(),
				}),
				checks: z.array(
					z.object({
						id: z.string(),
						latency: z.number().optional(),
						time: z.number(),

						status: z.number(),
						body: z.string(),

						headers: z.record(z.string()),
						timing: z.object({
							dnsStart: z.number(),
							dnsDone: z.number(),
							connectStart: z.number(),
							connectDone: z.number(),
							firstByteStart: z.number(),
							firstByteDone: z.number(),
							tlsHandshakeStart: z.number(),
							tlsHandshakeDone: z.number(),
							transferStart: z.number(),
							transferDone: z.number(),
						}),
					}),
				),
			}),
		),
	}),
});

export type Input = z.infer<typeof input>;
export type Output = ApiResponse<{
	id: string;
}>;

async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Output>,
): Promise<void> {
	const request = input.safeParse(req);
	if (!request.success) {
		throw new ApiError({
			status: 400,
			message: JSON.stringify(JSON.parse(request.error.message)),
		});
	}
	for (let i = 0; i < 100; i++) {
		const id = newShortId();
		const r = await redis.set(["play", id].join(":"), request.data.body, {
			ex: 7 * 24 * 60 * 60,
			nx: true,
		});

		if (r !== null) {
			res.json({ data: { id } });
			return;
		}
	}

	throw new ApiError({ status: 500, message: "Too many id collissions" });
}

export default withMiddleware(handler, withRecoverer(), withMethods("POST"));
