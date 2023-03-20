import { t } from "../trpc";
import { endpointRouter } from "./endpoints";
import { playRouter } from "./play";
import { billingRouter } from "./billing";
import { pageRouter } from "./page";
import { teamRouter } from "./team";
import { alertsRouter } from "./alerts";
import { channelsRouter } from "./channels";
import { tinybirdRouter } from "./tinybird";
export const router = t.router({
  play: playRouter,
  endpoint: endpointRouter,
  billing: billingRouter,
  page: pageRouter,
  team: teamRouter,
  alerts: alertsRouter,
  tinybird: tinybirdRouter,
  channels: channelsRouter,
});

// export type definition of API
export type Router = typeof router;
