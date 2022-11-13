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
		slug: z.string().regex(/^[a-z0-9-_]+$/),
		endpointIds: z.array(z.string()).min(1),
		teamId: z.string(),
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
			id: request.data.body.teamId,
		},
	});
	if (!team) {
		throw new ApiError({ status: 404, message: "team not found" });
	}

	const page = await db.statusPage.create({
		data: {
			id: newId("page"),
			name: request.data.body.name,
			slug: request.data.body.slug,
			endpoints: {
				connect: request.data.body.endpointIds.map((id) => ({ id })),
			},
			// assertions: assertions.serialize(as),
			team: {
				connect: {
					id: team.id,
				},
			},
		},
	});

	res.json({ data: page });
}

export default withMiddleware(handler, withRecoverer());
