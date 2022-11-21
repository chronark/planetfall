import { db, PrismaClient } from "@planetfall/db";
import { NextApiRequest, NextApiResponse } from "next";
import crypto from "node:crypto";
import { object, z } from "zod";
import { ApiError } from "lib/api/error";

import type { ApiResponse } from "lib/api/response";
import { withMiddleware, withRecoverer } from "lib/api/middleware";
import { newId } from "@planetfall/id";
import { getRole } from "lib/api";

const input = z.object({
	method: z.enum(["DELETE"]),
	query: z.object({
		endpointId: z.string(),
	}),
});
export type Input = z.infer<typeof input>;
export type Output = ApiResponse<{}>;

async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Output>,
): Promise<void> {
	const { role, userId } = await getRole(req, res);
	const auth = role.authorize({ endpoint: ["read"] });
	if (!auth.success) {
		throw new ApiError({
			status: 401,
			message: auth.error,
		});
	}

	const request = input.safeParse(req);
	if (!request.success) {
		throw new ApiError({
			status: 400,
			message: JSON.stringify(JSON.parse(request.error.message)),
		});
	}

	const endpoint = await db.endpoint.findUnique({
		where: { id: request.data.query.endpointId },
		include: {
			team: {
				include: { members: true },
			},
		},
	});

	if (!endpoint) {
		throw new ApiError({ status: 404, message: "endpoint not found" });
	}
	if (!endpoint.team.members.some((m) => m.userId === userId)) {
		throw new ApiError({ status: 403, message: "unauthorized" });
	}
	await db.endpoint.delete({ where: { id: request.data.query.endpointId } });

	res.json({ data: {} });
}

export default withMiddleware(handler, withRecoverer());
