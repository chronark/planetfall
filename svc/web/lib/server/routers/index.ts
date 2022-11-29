import { t } from "../trpc";
import { endpointRouter } from "./endpoints";
import { playRouter } from "./play";
export const router = t.router({
	play: playRouter,
	endpoint: endpointRouter,
});

// export type definition of API
export type Router = typeof router;
