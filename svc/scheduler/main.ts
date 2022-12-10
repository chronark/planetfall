import { Scheduler } from "./scheduler";
import { Events } from "./events";
import http from "node:http";
import "isomorphic-fetch";
import { newLogger } from "./logger";
import { Billing } from "./billing";
import { Notifications } from "./notifications";
import { Redis } from "@upstash/redis";
import { db } from "@planetfall/db";
import { Email } from "@planetfall/emails";

const logger = newLogger({ dataset: "scheduler" });

const notifications = new Notifications({
	logger,
	redis: Redis.fromEnv(),
	db: db,
	email: new Email(),
});

const s = new Scheduler({ logger, notifications });
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
