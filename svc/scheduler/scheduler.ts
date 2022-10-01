import { Endpoint, PrismaClient, Region } from "@planetfall/db";
import { newId } from "@planetfall/id";
import { string } from "zod";
export class Scheduler {
  // Map of endpoint id -> clearInterval function
  private clearIntervals: Record<string, () => void>;
  private db: PrismaClient;

  constructor() {
    this.db = new PrismaClient();
    this.clearIntervals = {};
  }

  public async syncEndpoints(): Promise<void> {
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
      if (!(endpoint.id in this.clearIntervals)) {
        this.addEndpoint(endpoint.id);
      }
    }
  }

  public async addEndpoint(endpointId: string): Promise<void> {
    console.log("adding new endpoint", endpointId);
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
    console.log("removing endpoint", endpointId);

    if (endpointId in this.clearIntervals) {
      this.clearIntervals[endpointId]();
      delete this.clearIntervals[endpointId];
    }
  }

  private async testEndpoint(
    endpoint: Endpoint & { regions: Region[] },
  ): Promise<void> {
    console.log("testing endpoint", JSON.stringify(endpoint, null, 2));

    await Promise.all(endpoint.regions.map(async (region) => {
      const time = Date.now();
      const res = await fetch(region.url, {
        method: "POST",
        body: JSON.stringify({
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            url: endpoint.url,
            method: endpoint.method,
            headers: endpoint.headers,
            body: endpoint.body,
          },
        }),
      });
      if (!res.ok) {
        console.error(`unable to ping: ${region.id}: ${res.status}`);
        return;
      }

      const body = await res.json();
      if ("error" in body) {
        console.error((body as { error: string }).error);
        return;
      }

      const { status, latency } = body as { status: number; latency: number };

      await this.db.check.create({
        data: {
          id: newId("check"),
          endpoint: {
            connect: {
              id: endpoint.id,
            },
          },
          latency,
          time,
          status,
          region: {
            connect: {
              id: region.id,
            },
          },
        },
      });
    }));
  }
}
