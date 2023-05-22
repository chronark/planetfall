import { t } from "../trpc";
import { alertsRouter } from "./alerts";
import { apikeyRouter } from "./apikey";
import { billingRouter } from "./billing";
import { channelsRouter } from "./channels";
import { endpointRouter } from "./endpoints";
import { pageRouter } from "./page";
import { plainRouter } from "./plain";
import { playRouter } from "./play";
import { teamRouter } from "./team";
import { tinybirdRouter } from "./tinybird";
export const router = t.router({
  alerts: alertsRouter,
  apikey: apikeyRouter,
  billing: billingRouter,
  channels: channelsRouter,
  endpoint: endpointRouter,
  page: pageRouter,
  plain: plainRouter,
  play: playRouter,
  team: teamRouter,
  tinybird: tinybirdRouter,
});

// export type definition of API
export type Router = typeof router;
