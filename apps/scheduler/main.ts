import { AlertNotifications } from "./alerts";
import { Logger } from "./logger";
import { Notifications } from "./notifications";
import { Scheduler } from "./scheduler";
import { db } from "@planetfall/db";
import { Email } from "@planetfall/emails/dist/client";
import { Redis } from "@upstash/redis";
import "isomorphic-fetch";
import http from "node:http";

const logger = new Logger();
const email = new Email();
const redis = Redis.fromEnv();

const notifications = new Notifications({
  db,
  email,
  redis,
  logger,
});
const alerts = new AlertNotifications({
  logger,
  db,
  email,
});

const signingKey = process.env.SIGNING_PRIVATE_KEY;
if (!signingKey) {
  throw new Error("SIGNING_PRIVATE_KEY is required");
}

const s = new Scheduler({ logger, alerts, notifications, signingKey });
s.run();

const server = http.createServer((_req, res) => {
  logger.info("Incoming health check");
  res.writeHead(200);
  res.end("OK");
});
server.listen(process.env.PORT ?? 8000);
