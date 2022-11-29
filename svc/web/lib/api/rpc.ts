import type { RPC } from "pages/api/v1/checks";
import { createMutation } from "@chronark/next-rpc";

export const api = {
	checks: {
		create: createMutation<RPC>({ path: "/api/v1/checks" }),
	},
};
