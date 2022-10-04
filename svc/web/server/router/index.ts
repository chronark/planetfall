import { t } from "../trpc";
import { teamRouter } from "./team";
import { endpointRouter } from "./endpoint";
import { regionRouter } from "./region";
import { authRouter } from "./auth";
import { pageRouter } from "./page";
import { checkRouter } from "./check";

export const router = t.router({
  team: teamRouter,
  endpoint: endpointRouter,
  page: pageRouter,
  region: regionRouter,
  auth: authRouter,
  check: checkRouter,
});

// export type definition of API
export type Router = typeof router;
