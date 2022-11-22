import { db } from "@planetfall/db";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { ApiError } from "lib/api/error";
import type { ApiResponse } from "lib/api/response";

const input = z.object({
	method: z.enum(["GET"]),
	headers: z.object({
		authorization: z.string(),
	}),
});
export type Input = z.infer<typeof input>;
export type Output = ApiResponse<
	{
		id: string;
		name: string;
		platform: string;
	}[]
>;

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
		const regions = await db.region.findMany();

		res.json({
			data: regions.map(({ id, name, platform }) => ({ id, name, platform })),
		});
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
