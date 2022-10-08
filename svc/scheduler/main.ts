import { Scheduler } from "./scheduler";
import { Events } from "./events";
import http from "node:http";
import "isomorphic-fetch";
import { newLogger } from "./logger";

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
