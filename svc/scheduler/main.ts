import { Scheduler } from "./scheduler";
import { Events } from "./events";

async function main() {
  const s = new Scheduler();
  const e = new Events(s);

  e.run();
}

main();
