import { Scheduler } from "./scheduler";
import { Events } from "./events";
import "isomorphic-fetch";

async function main() {
  const s = new Scheduler();
  const e = new Events(s);

  e.run();

  s.syncEndpoints();
  setInterval(() => s.syncEndpoints(), 60 * 1000);
}

main();
