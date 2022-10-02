import { t } from "../trpc";
import { teamRouter } from "./team";
import { endpointRouter } from "./endpoint";
import { regionRouter } from "./region";
import { authRouter } from "./auth";

export const router = t.router({
  team: teamRouter,
  endpoint: endpointRouter,
  region: regionRouter,
  auth: authRouter,
});

// export type definition of API
export type Router = typeof router;
