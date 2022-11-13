import { db, PrismaClient } from "@planetfall/db";
import { NextApiRequest, NextApiResponse } from "next";
import crypto from "node:crypto";
import { object, z } from "zod";
import { ApiError } from "lib/api/error";
import { getAuth } from "@clerk/nextjs/server";

import type { ApiResponse } from "lib/api/response";
import { withMiddleware, withRecoverer } from "lib/api/middleware";
import { newId } from "@planetfall/id";

const input = z.object({
	method: z.enum(["POST"]),
	headers: z.object({
		"content-type": z.enum(["application/json"]),
	}),
	body: z.object({
		name: z.string(),
		method: z.enum(["POST", "GET", "PUT", "DELETE"]),
		url: z.string().url(),
		body: z.string().optional(),
		headers: z.record(z.string()).optional(),
		degradedAfter: z.number().int().positive().optional(),
		timeout: z.number().int().positive().optional(),
		interval: z.number().int().positive(),
		regionIds: z.array(z.string()).min(1),
		distribution: z.enum(["ALL", "RANDOM"]),
		teamSlug: z.string(),
		statusAssertions: z
			.array(
				z.object({
					comparison: z.enum(["gte", "lt", "gt", "lte", "eq"]),
					target: z.number().int(),
				}),
			)
			.optional(),
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
	const auth = getAuth(req);

	if (!auth.sessionId) {
		throw new ApiError({ status: 403, message: "Missing auth" });
	}

	const request = input.safeParse(req);
	if (!request.success) {
		throw new ApiError({
			status: 400,
			message: JSON.stringify(JSON.parse(request.error.message)),
		});
	}
	const team = await db.team.findUnique({
		where: {
			slug: request.data.body.teamSlug,
		},
	});
	if (!team) {
		throw new ApiError({ status: 404, message: "team not found" });
	}

	if (
		request.data.body.timeout &&
		request.data.body.timeout > team.maxTimeout
	) {
		throw new ApiError({
			status: 401,
			message: "Requested timeout is higher than your plan allows",
		});
	}

	const endpoint = await db.endpoint.create({
		data: {
			id: newId("endpoint"),
			method: request.data.body.method,
			name: request.data.body.name,
			// team:
			url: request.data.body.url,
			interval: request.data.body.interval,
			active: true,
			degradedAfter: request.data.body.degradedAfter,
			timeout: request.data.body.timeout,
			distribution: request.data.body.distribution,
			regions: {
				connect: request.data.body.regionIds.map((id) => ({ id })),
			},
			// assertions: assertions.serialize(as),
			team: {
				connect: {
					id: team.id,
				},
			},
			headers: request.data.body.headers,
			body: request.data.body.body,
		},
	});

	res.json({ data: endpoint });
}

export default withMiddleware(handler, withRecoverer());
