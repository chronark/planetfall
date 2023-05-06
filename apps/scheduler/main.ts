import { Scheduler } from "./scheduler";
import http from "node:http";
import "isomorphic-fetch";
import { Logger } from "./logger";
import { AlertNotifications } from "./alerts";
import { db } from "@planetfall/db";
import { Email } from "@planetfall/emails/dist/client";
import { Redis } from "@upstash/redis";
import { Notifications } from "./notifications";

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
  db: db,
  email,
});

const s = new Scheduler({ logger, alerts, notifications });
s.run();

const server = http.createServer((_req, res) => {
  logger.info("Incoming health check");
  res.writeHead(200);
  res.end("OK");
});
server.listen(process.env.PORT ?? 8000);
