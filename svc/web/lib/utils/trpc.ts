import { createTRPCProxyClient, httpLink } from "@trpc/client";
import type { Router } from "../server/routers";

function getBaseUrl() {
	if (typeof window !== "undefined") {
		// browser should use relative path
		return "";
	}

	if (process.env.VERCEL_URL) {
		// reference for vercel.com
		return `https://${process.env.VERCEL_URL}`;
	}

	// assume localhost
	return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpc = createTRPCProxyClient<Router>({
	links: [
		httpLink({
			url: `${getBaseUrl()}/api/trpc`,
		}),
	],
});
