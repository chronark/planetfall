import { t } from "../trpc";
import { alertsRouter } from "./alerts";
import { billingRouter } from "./billing";
import { channelsRouter } from "./channels";
import { endpointRouter } from "./endpoints";
import { pageRouter } from "./page";
import { playRouter } from "./play";
import { teamRouter } from "./team";
import { tinybirdRouter } from "./tinybird";
import { plainRouter } from "./plain";
export const router = t.router({
  play: playRouter,
  endpoint: endpointRouter,
  billing: billingRouter,
  page: pageRouter,
  team: teamRouter,
  alerts: alertsRouter,
  tinybird: tinybirdRouter,
  channels: channelsRouter,
  plain: plainRouter,
});

// export type definition of API
export type Router = typeof router;
