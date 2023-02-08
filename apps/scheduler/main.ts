import { Scheduler } from "./scheduler";
import { Events } from "./events";
import http from "node:http";
import "isomorphic-fetch";
import { Logger } from "./logger";
import { Notifications } from "./notifications";
import { Redis } from "@upstash/redis";
import { db } from "@planetfall/db";
import { Email } from "@planetfall/emails";

const logger = new Logger();

const notifications = new Notifications({
	logger,
	db: db,
	email: new Email(),
});

const s = new Scheduler({ logger, notifications });
// const e = new Events({ scheduler: s, logger });

// e.run();

s.syncEndpoints();
setInterval(() => s.syncEndpoints(), 60 * 1000);

const server = http.createServer((_req, res) => {
	logger.info("Incoming health check");
	res.writeHead(200);
	res.end("OK");
});
server.listen(process.env.PORT ?? 8000);
