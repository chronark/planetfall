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
    const url = new URL("/v0/events", this.baseUrl)
    url.searchParams.set("name", event);

    const body = (Array.isArray(payload) ? payload : [payload]).map((p) =>
      JSON.stringify(p)
    ).join("\n");
    const res = await fetch(url, {
      method: "POST",
      body,
      headers: { Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}` },
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
  }

  public async publishChecks(checks: Check[]): Promise<void> {
    await this.publish("production__checks__v2", checks);
  }

  
}

type Check = {
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
};
