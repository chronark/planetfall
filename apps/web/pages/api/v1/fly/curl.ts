import { db } from "@planetfall/db";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { ApiError } from "lib/api/error";
import type { ApiResponse } from "lib/api/response";
import { newId, newShortId } from "@planetfall/id";
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();
const input = z.object({
	method: z.enum(["POST"]),
	headers: z.object({
		"content-type": z.enum(["application/json"]),
		authorization: z.string(),
	}),
	body: z.object({
		method: z.enum(["GET", "POST", "PUT", "DELETE"]),
		url: z.string().url(),
		regionIds: z.array(z.string()).min(1),
		repeat: z.boolean().optional(),
		headers: z.record(z.string()).optional(),
	}),
});

export type Input = z.infer<typeof input>;

type Check = {
	id: string;
	latency?: number;
	time: number;
	status: number;
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
};
export type Output = ApiResponse<{
	link: string;
	regions: {
		id: string;
		name: string;
		checks: Check[];
	}[];
}>;

export type Shared = {
	method: string;
	url: string;
	time: number;
	regions: {
		id: string;
		name: string;
		checks: Check[];
	}[];
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Output>,
): Promise<void> {
	try {
		const request = input.safeParse(req);
		if (!request.success) {
			throw new ApiError({
				status: 400,
				message: JSON.stringify(JSON.parse(request.error.message)),
			});
		}

		if (
			request.data.headers.authorization !== "Bearer api_QBtj38SuDKzWvRQoW1wG3x"
		) {
			throw new ApiError({ status: 401, message: "invalid token" });
		}
		const regions = await Promise.all(
			request.data.body.regionIds.map(async (regionId) => {
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
				});
				if (region.platform === "fly") {
					headers.set("Fly-Prefer-Region", region.region);
				}
				const res = await fetch(region.url, {
					method: "POST",
					headers,
					body: JSON.stringify({
						url: request.data.body.url,
						method: request.data.body.method,
						timeout: 2000,
						checks: request.data.body.repeat ? 2 : 1,
						headers: request.data.body.headers,
					}),
				});
				if (res.status !== 200) {
					throw new ApiError({
						status: 500,
						message: `unable to ping: ${region.id} [${
							res.status
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
					id: region.id,
					name: region.name,
					checks: checks.map((c) => ({
						...c,
						id: newId("check"),
					})),
				};
			}),
		);

		const s: Shared = {
			method: request.data.body.method,
			url: request.data.body.url,
			time: Date.now(),
			regions,
		};

		const id = newShortId();
		const saved = await redis.set(["fly", id].join(":"), s, {
			ex: 7 * 24 * 60 * 60,
			nx: true,
		});

		if (saved === null) {
			throw new ApiError({ status: 500, message: "share id collission" });
		}

		res.json({ data: { link: `https://planetfall.io/fly/${id}`, regions } });
		return;
	} catch (e) {
		if (e instanceof ApiError) {
			console.error(e.message);
			res.status(e.status).json({
				error: { code: e.status.toString(), message: e.message },
			});
			return;
		}
		res.status(500).json({
			error: { code: "unexpected", message: (e as Error).message },
		});
	}
}
