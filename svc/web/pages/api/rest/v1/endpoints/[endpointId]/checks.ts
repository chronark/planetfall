import { db, PrismaClient } from "@planetfall/db";
import {} from "@planetfall/auth";
import { NextApiRequest, NextApiResponse } from "next";
import crypto from "node:crypto";
import { z } from "zod";
import { ApiError, ApiResponse, getRole } from "lib/api";

const input = z.object({
	method: z.enum(["GET"]),
	query: z.object({
		endpointId: z.string(),
		since: z
			.string()
			.transform((since, ctx) => {
				const n = parseInt(since);
				if (Number.isNaN(n)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "not an integer",
					});
				}
				return n;
			})
			.optional(),
		region: z.string().optional(),
		limit: z
			.string()
			.transform((limit, ctx) => {
				const n = parseInt(limit);
				if (Number.isNaN(n)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "not an integer",
					});
				}
				if (n <= 0) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "must be positive",
					});
				}
				return n;
			})
			.optional(),
	}),
});
export type Input = z.infer<typeof input>;
export type Output = ApiResponse<
	{
		id: string;
		endpointId: string;
		latency?: number;
		time: number;

		error?: string;
		status?: number;
		body?: string;

		headers?: Record<string, string>;
		regionId: string;
	}[]
>;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Output>,
): Promise<void> {
	try {
		const role = await getRole(req);
		const auth = role.authorize({ check: ["read"] });
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
			where: {
				id: request.data.query.endpointId,
			},
		});
		if (!endpoint) {
			throw new ApiError({ status: 404, message: "endpoint not found" });
		}
		throw new ApiError({ status: 500, message: "TODO:" });
		// const user = endpoint.team.members.find((m) => m.userId === token.userId);
		// if (!user) {
		//   throw new ApiError({
		//     status: 401,
		//     message: "user does not belong to team",
		//   });
		// }

		// const checks = await db.check.findMany({
		//   where: {
		//     endpointId: request.data.query.endpointId,
		//     regionId: request.data.query.region,
		//     time: {
		//       gte: request.data.query.since
		//         ? new Date(request.data.query.since)
		//         : undefined,
		//     },
		//   },
		//   orderBy: {
		//     time: "desc",
		//   },
		//   take: request.data.query.limit || 1000,
		// });

		// res.json({
		//   data: checks.map((c) => ({
		//     ...c,
		//     headers: c.headers !== null
		//       ? c.headers as Record<string, string>
		//       : undefined,
		//     body: c.body ?? undefined,
		//     time: c.time.getTime(),
		//     latency: c.latency !== null ? c.latency : undefined,
		//     error: c.error ?? undefined,
		//     status: c.status ?? undefined,
		//   })),
		// });
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
