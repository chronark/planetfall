import { t } from "../trpc";
import { endpointRouter } from "./endpoints";
import { playRouter } from "./play";
import { billingRouter } from "./billing";
export const router = t.router({
	play: playRouter,
	endpoint: endpointRouter,
	billing: billingRouter,
});

// export type definition of API
export type Router = typeof router;
