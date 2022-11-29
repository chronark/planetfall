import { t } from "../trpc";
import { playRouter } from "./play";

export const router = t.router({
	play: playRouter,
});

// export type definition of API
export type Router = typeof router;
