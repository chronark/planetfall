import { t } from "../trpc";
import { endpointRouter } from "./endpoints";
import { playRouter } from "./play";
import { billingRouter } from "./billing";
import { pageRouter } from "./page";
export const router = t.router({
	play: playRouter,
	endpoint: endpointRouter,
	billing: billingRouter,
	page: pageRouter,
});

// export type definition of API
export type Router = typeof router;
