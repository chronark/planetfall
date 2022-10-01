import { Endpoint, PrismaClient } from "@planetfall/db";

export class Scheduler {
  // Map of endpoint id -> clearInterval function
  private clearIntervals: Record<string, () => void>;
  private db: PrismaClient;

  constructor() {
    this.db = new PrismaClient();
    this.clearIntervals = {};
  }

  public async addEndpoint(endpointId: string): Promise<void> {
    console.log("adding new endpoint", endpointId);
    const endpoint = await this.db.endpoint.findUnique({
      where: { id: endpointId },
    });
    if (!endpoint) {
      throw new Error(`endpoint not found: ${endpointId}`);
    }
    this.removeEndpoint(endpoint.id);
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
    }
  }

  private async testEndpoint(endpoint: Endpoint): Promise<void> {
    console.log("testing endpoint", JSON.stringify(endpoint, null, 2));
  }
}
