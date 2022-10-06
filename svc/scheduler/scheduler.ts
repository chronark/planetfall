import { Endpoint, PrismaClient, Region } from "@planetfall/db";
import { newId } from "@planetfall/id";
import { Logger } from "./logger";
export class Scheduler {
  // Map of endpoint id -> clearInterval function
  private clearIntervals: Record<string, () => void>;
  private db: PrismaClient;
  private updatedAt: number = 0;
  private logger: Logger

  constructor({ logger }: { logger: Logger }) {
    this.db = new PrismaClient();
    this.clearIntervals = {};
    this.logger = logger
  }

  public async syncEndpoints(): Promise<void> {
    this.logger.info("Syncing endpoints")
    const now = Date.now();
    const endpoints = await this.db.endpoint.findMany({
      where: {
        active: true,
      },
    });

    const wantIds = endpoints.reduce((acc, { id }) => {
      acc[id] = true;
      return acc;
    }, {} as Record<string, boolean>);

    for (const endpointId of Object.keys(this.clearIntervals)) {
      if (!wantIds[endpointId]) {
        this.removeEndpoint(endpointId);
      }
    }

    for (const endpoint of endpoints) {
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

    this.updatedAt = now;
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
      endpoint.interval * 1000,
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
      this.logger.info("testing endpoint", { endpointId: endpoint.id });

      await Promise.all((endpoint.regions as string[]).map(async (regionId) => {
        const region = await this.db.region.findUnique({
          where: { id: regionId },
        });
        if (!region) {
          throw new Error(`region not found: ${regionId}`);
        }
        this.logger.info("testing endpoint", {endpointId:endpoint.id,regionId: region.id});

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
            body: endpoint.body,
          }),
        });
        if (!res.ok) {
          throw new Error(
            `unable to ping: ${region.id}: ${await res.text()}`,
          );
        }

        const body = await res.json();

        const { status, latency } = body as { status: number; latency: number };

        await this.db.check.create({
          data: {
            id: newId("check"),
            endpointId: endpoint.id,
            latency,
            time,
            status,
            regionId,
          },
        });
      }));
    } catch (err) {
      this.logger.error((err as Error).message);
    }
  }
}
