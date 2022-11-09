export class Client {
  private readonly baseUrl = "https://api.tinybird.co";
  private readonly token: string;

  constructor(token?: string) {
    token ??= process.env.TINYBIRD_TOKEN;

    if (!token) {
      throw new Error("tinybird token is missing");
    }
    this.token = token;
  }

  public async publish<TEvent extends Record<string, unknown>>(
    event: string,
    payload: TEvent | TEvent[],
  ): Promise<void> {
    const url = new URL("/v0/events", this.baseUrl);
    url.searchParams.set("name", event);

    const body = (Array.isArray(payload) ? payload : [payload]).map((p) =>
      JSON.stringify(p)
    ).join("\n");
    const res = await fetch(url.toString(), {
      method: "POST",
      body,
      headers: { Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}` },
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
  }

  public async publishChecks(checks: Check[]): Promise<void> {
    await this.publish("production__checks__v3", checks);
  }


  public async getEndpointStats(endpointId: string): Promise<EndpointStats | null> {
    const url = new URL("/v0/pipes/production__endpoint_stats_24h__v1.json", this.baseUrl);
    url.searchParams.set("endpointId", endpointId);
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}` },
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = await res.json() as { data: EndpointStats[] }
    if (data.data.length === 0) {
      return null
    }
    return data.data[0]
  }


  public async getLatestChecksByEndpoint(endpointId: string, errorsOnly?: boolean): Promise<Check[]> {
    const url = new URL("/v0/pipes/production__latest_checks_by_endpoint__v1.json", this.baseUrl);
    url.searchParams.set("endpointId", endpointId);
    if (errorsOnly) {
      url.searchParams.set("errorsOnly", "true")
    }
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}` },
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = await res.json() as { data: Check[] }
    if (data.data.length === 0) {
      return []
    }
    return data.data
  }
}


export type EndpointStats = {
  count: number
  min: number
  max: number
  p50: number
  p95: number
  p99: number


}
export type Check = {
  id: string;
  endpointId: string;
  latency: number;
  regionId: string;
  status: number;
  teamId: string;
  time: Date;
  timing: string;
  body: string;
  header: string;
  source?: string;
  error?: string
};
