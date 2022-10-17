import { Scheduler } from "./scheduler";
import { Events } from "./events";
import http from "node:http";
import "isomorphic-fetch";
import { newLogger } from "./logger";
import { Billing } from "./billing";
import { Janitor } from "./janitor";

const logger = newLogger({ dataset: "scheduler" });
const s = new Scheduler({ logger });
const e = new Events({ scheduler: s, logger });

e.run();

s.syncEndpoints();
setInterval(() => s.syncEndpoints(), 60 * 1000);

const server = http.createServer((_req, res) => {
  logger.info("Incoming health check");
  res.writeHead(200);
  res.end("OK");
});
server.listen(process.env.PORT ?? 8000);

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  logger.warn("BILLING IS NOT ENABLED");
}
if (stripeSecretKey) {
  const billing = new Billing({ logger, stripeSecretKey });
  setInterval(() => billing.run(), 60_000);
}



const janitor = new Janitor({ logger })
setInterval(()=>janitor.run(), 60 * 1000)