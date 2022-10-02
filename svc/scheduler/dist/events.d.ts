import { Scheduler } from "./scheduler";
export declare class Events {
  private scheduler;
  private kafka;
  constructor(scheduler: Scheduler);
  run(): Promise<void>;
}
//# sourceMappingURL=events.d.ts.map
