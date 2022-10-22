import { PrismaClient } from "@planetfall/db";
import { Logger } from "./logger";

export class Janitor {
  private db: PrismaClient;
  private logger: Logger;

  constructor(opts: { logger: Logger }) {
    this.db = new PrismaClient();
    if (!opts.logger) {
      throw new Error("janitor requires logger");
    }
    this.logger = opts.logger;
  }

  public async run(): Promise<void> {
    this.logger.info("janitor running");

    const teams = await this.db.team.findMany({
      include: {
        endpoints: true
      }
    });

    for (const t of teams) {
      const cutoff = new Date(Date.now() - t.retention);
      this.logger.info("Expiring checks", {
        teamId: t.id,
        cutoff,
      });
      try {
        const evicted = await this.db.check.deleteMany({
          where: {
            endpointId: {
              in: t.endpoints.map(e => e.id)
            },
            time: {
              lt: cutoff,
            },
          },
        });
        this.logger.info("Evicted checks", {
          teamId: t.id,
          count: evicted.count,
        });
      } catch (e) {
        this.logger.error((e as Error).message, {
          teamId: t.id,
        });
      }
    }
  }
}
