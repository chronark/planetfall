import { Endpoint, PrismaClient, Region } from "@planetfall/db";
import { newId } from "@planetfall/id";
import { Logger } from "./logger";
export class Scheduler {
  // Map of endpoint id -> clearInterval function
  private clearIntervals: Record<string, () => void>;
  private db: PrismaClient;
  private updatedAt: number = 0;
  private logger: Logger;
  regions: Record<string, Region>;

  constructor({ logger }: { logger: Logger }) {
    this.db = new PrismaClient();
    this.clearIntervals = {};
    this.logger = logger;
    this.regions = {};
    setInterval(() => {
      this.regions = {};
    }, 5 * 60 * 1000);
  }

  public async syncEndpoints(): Promise<void> {
    this.logger.info("Syncing endpoints");
    const now = new Date();

    const want: Record<string, Endpoint> = {};

    const teams = await this.db.team.findMany({
      where: {
        plan: {
          notIn: ["DISABLED"],
        },
      },
      include: {
        endpoints: true,
      },
    });

    for (const t of teams) {
      const since = t.stripeCurrentBillingPeriodStart ??
        new Date(now.getUTCFullYear(), now.getUTCMonth());
      const usage = await this.db.check.count({
        where: {
          time: {
            gte: since,
          },
          endpoint: {
            teamId: t.id,
          },
        },
      });
      if (usage > t.maxMonthlyRequests) {
        this.logger.info("team has exceeded monthly requests", {
          teamId: t.id,
          maxMonthlyRequests: t.maxMonthlyRequests,
          since,
          usage,
        });
        break;
      }

      for (const e of t.endpoints) {
        want[e.id] = e;
      }
    }

    for (const endpointId of Object.keys(this.clearIntervals)) {
      if (!want[endpointId]) {
        this.removeEndpoint(endpointId);
      }
    }

    for (const endpoint of Object.values(want)) {
      if (endpoint.id in this.clearIntervals) {
        // if it was updated since the last time
        if (endpoint.updatedAt.getTime() > this.updatedAt) {
          this.removeEndpoint(endpoint.id);
          this.addEndpoint(endpoint.id);
        }
      } else {
        this.addEndpoint(endpoint.id);
      }
    }

    this.updatedAt = now.getTime();
  }

  public async addEndpoint(endpointId: string): Promise<void> {
    this.logger.info("adding new endpoint", { endpointId });
    const endpoint = await this.db.endpoint.findUnique({
      where: { id: endpointId },
    });
    if (!endpoint) {
      throw new Error(`endpoint not found: ${endpointId}`);
    }
    this.removeEndpoint(endpoint.id);
    this.testEndpoint(endpoint);
    const intervalId = setInterval(
      () => (this.testEndpoint(endpoint)),
      endpoint.interval,
    );
    this.clearIntervals[endpoint.id] = () => clearInterval(intervalId);
  }

  public removeEndpoint(endpointId: string): void {
    this.logger.info("removing endpoint", { endpointId });

    if (endpointId in this.clearIntervals) {
      this.clearIntervals[endpointId]();
      delete this.clearIntervals[endpointId];
    }
  }

  private async testEndpoint(
    endpoint: Endpoint,
  ): Promise<void> {
    try {
      const allRegions = endpoint.regions as string[];
      if (allRegions.length === 0) {
        throw new Error(`endpoint ${endpoint.id} has no active regions`);
      }
      const regions = endpoint.distribution === "ALL"
        ? allRegions
        : [allRegions[Math.floor(Math.random() * allRegions.length)]];
      this.logger.info("testing endpoint", {
        endpointId: endpoint.id,
        regions,
      });

      await Promise.all(regions.map(async (regionId) => {
        let region = this.regions[regionId];
        if (!region) {
          const res = await this.db.region.findUnique({
            where: { id: regionId },
          });
          if (!res) {
            throw new Error(`region not found: ${regionId}`);
          }
          region = res;
          this.regions[regionId] = res;
        }
        this.logger.info("testing endpoint", {
          endpointId: endpoint.id,
          regionId: region.id,
        });

        // Date object in UTC timezone
        const time = new Date(new Date().toUTCString());

        const res = await fetch(region.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: endpoint.url,
            method: endpoint.method,
            headers: endpoint.headers,
            body: endpoint.body ?? undefined,
          }),
        });
        if (!res.ok) {
          throw new Error(
            `unable to ping: ${region.id}: ${await res.text()}`,
          );
        }

        const body = await res.json();

        const { status, latency } = body as { status: number; latency: number };

        let error: string | undefined = undefined;

        await this.db.check.create({
          data: {
            id: newId("check"),
            endpointId: endpoint.id,
            latency,
            time,
            status,
            regionId,
            error,
          },
        });
      }));
    } catch (err) {
      this.logger.error((err as Error).message);
    }
  }
}
