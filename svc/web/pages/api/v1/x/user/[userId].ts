import { Query } from "@chronark/next-rpc";

import { z } from "zod";

export const userQuery = new Query({
	input: z.object({
		userId: z.string(),
	}),
	output: z.object({
		userId: z.string(),
		email: z.string(),
	}),
	path: (req) => `/api/v1/x/user/${req.userId}`,
});

export default userQuery.handle((req) => {
	return {
		userId: req.input.userId,
		email: req.input.userId,
	};
});
