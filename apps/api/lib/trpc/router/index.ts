import { t } from "../trpc";
import { endpointsRouter } from "./endpoints";

export const router = t.router({
  endpoints: endpointsRouter,
});

export type Router = typeof router;
