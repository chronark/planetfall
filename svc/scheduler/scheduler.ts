import { Endpoint, PrismaClient, Region } from "@planetfall/db";
import { newId } from "@planetfall/id";
import { Logger } from "./logger";
import * as assertions from "@planetfall/assertions";
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
      include: {
        regions: true,
      },
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
    endpoint: Endpoint & { regions: Region[] },
  ): Promise<void> {
    try {
      if (endpoint.regions.length === 0) {
        throw new Error(`endpoint ${endpoint.id} has no active regions`);
      }
      const regions = endpoint.distribution === "ALL" ? endpoint.regions : [
        endpoint.regions[Math.floor(Math.random() * endpoint.regions.length)],
      ];
      this.logger.info("testing endpoint", {
        endpointId: endpoint.id,
        regions: regions.map((r) => r.id),
      });

      await Promise.all(regions.map(async ({ id: regionId }) => {
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
            timeout: endpoint.timeout ?? undefined,
            checks: 1,
          }),
        });
        if (res.status !== 200) {
          throw new Error(
            `unable to ping: ${region.id} [${res.status}]: ${await res.text()}`,
          );
        }

        const parsed = await res.json() as {
          time: number;
          status: number;
          latency: number;
          body: string;
          headers: Record<string, string>;
          timing: {
            dnsStart: number;
            dnsDone: number;
            connectStart: number;
            connectDone: number;
            firstByteStart: number;
            firstByteDone: number;
            tlsHandshakeStart: number;
            tlsHandshakeDone: number;
          };
        }[];

        let error: string | undefined = undefined;

        // const as = assertions.deserialize(endpoint.assertions as any ?? []);
        // for (const a of as) {
        //   this.logger.info("asserting stuff", {
        //     type: a.type,
        //     schema: a.schema,
        //     status: parsed.status,
        //   });
        //   const assertionResponse = a.assert(parsed);
        //   if (!assertionResponse.success) {
        //     error = assertionResponse.error;
        //     this.logger.warn("Assertion failed", { error });
        //     break;
        //   }
        // }

        const runId = parsed.length > 1 ? newId("run") : undefined;

        await this.db.check.createMany({
          data: parsed.map((c) => ({
            id: newId("check"),
            runId,
            endpointId: endpoint.id,
            latency: c.latency,
            time: new Date(c.time),
            status: c.status,
            regionId,
            error,
            body: c.body,
            headers: c.headers,
            timing: c.timing,
          })),
        });
      }));
    } catch (err) {
      this.logger.error((err as Error).message);
    }
  }
}
