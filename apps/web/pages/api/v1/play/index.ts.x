import { db, PrismaClient } from "@planetfall/db";
import { getRole } from "lib/api";
import { NextApiRequest, NextApiResponse } from "next";
import crypto from "node:crypto";
import { z } from "zod";
import { ApiError } from "lib/api/error";
import type { ApiResponse } from "lib/api/response";
import { newId } from "@planetfall/id";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { Mutation } from "@chronark/next-rpc";


const ratelimit = new Ratelimit({
	redis: Redis.fromEnv(),
	limiter: Ratelimit.fixedWindow(10, "10 s"),
});

const input = z.object({
	method: z.enum(["GET", "POST", "PUT", "DELETE"]),
	url: z.string().url(),
	regionIds: z.array(z.string()).min(1).max(5),
	repeat: z.boolean().optional(),
})
const output = z.array(z.object({
	region: z.object({
		id: z.string(),
		name: z.string(),
	}),
	checks: z.array(z.object({
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
		})
	}))
}))


export const mutation = new Mutation({ input, output, path: "/api/v1/play" })
export default mutation.handle(async ({ input }) => {

	const { success } = await ratelimit.limit("global");
	if (!success) {
		throw new ApiError({
			status: 429,
			message: "Too many requests, please try again later",
		});
	}

	return await Promise.all(
		input.regionIds.map(async (regionId) => {
			const region = await db.region.findUnique({
				where: { id: regionId },
			});
			if (!region) {
				throw new ApiError({
					status: 400,
					message: `regionId: ${regionId} not found`,
				});
			}
			const headers = new Headers({
				"Content-Type": "application/json",

			})
			if (region.platform === "fly") {
				headers.set("Fly-Prefer-Region", region.region)
			}
			const res = await fetch(region.url, {
				method: "POST",
				headers,
				body: JSON.stringify({
					url: input.url,
					method: input.method,
					timeout: 2000,
					checks: input.repeat ? 2 : 1,
				}),
			});
			if (res.status !== 200) {
				throw new ApiError({
					status: 500,
					message: `unable to ping: ${region.id} [${res.status
						}]: ${await res.text()}`,
				});
			}

			const checks = (await res.json()) as {
				time: number;
				status: number;
				latency: number;
				body: string;
				headers: Record<string, string>;
				timing: {
					dnsStart: number;
					dnsDone: number;
					connectStart: number;
					connectDone: number;
					firstByteStart: number;
					firstByteDone: number;
					tlsHandshakeStart: number;
					tlsHandshakeDone: number;
					transferStart: number;
					transferDone: number;
				};
			}[];

			return {
				region: {
					id: region.id,
					name: region.name,
				},
				checks: checks.map((c) => ({
					...c,
					id: newId("check"),
				})),
			};
		}),
	);
})
