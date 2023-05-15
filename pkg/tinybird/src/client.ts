import { z } from "zod";
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

  private async fetch<T>(
    pipe: string,
    opts?: Record<string, string | number | boolean>,
  ): Promise<T> {
    const url = new URL(`/v0/pipes/${pipe}.json`, this.baseUrl);
    if (opts) {
      for (const [key, value] of Object.entries(opts)) {
        url.searchParams.set(key, String(value));
      }
    }
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (!res.ok) {
      throw new Error(`Error reading pipe ${pipe}: ${await res.text()}`);
    }
    const json = await res.json();
    return json.data as T;
  }

  public async publish<TEvent extends Record<string, unknown>>(
    event: string,
    payload: TEvent | TEvent[],
  ): Promise<void> {
    const url = new URL("/v0/events", this.baseUrl);
    url.searchParams.set("name", event);

    const body = (Array.isArray(payload) ? payload : [payload])
      .map((p) => JSON.stringify(p))
      .join("\n");
    const res = await fetch(url.toString(), {
      method: "POST",
      body,
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
  }

  public async publishChecks(checks: Check[]): Promise<void> {
    await Promise.all([this.publish(
      "checks__v3",
      checks.map((c) => ({
        id: c.id,
        endpointId: c.endpointId,
        latency: c.latency,
        regionId: c.regionId,
        status: c.status,
        teamId: c.teamId,
        time: c.time,
        error: c.error,
        body: c.body,
        headers: JSON.stringify(c.headers ?? {}),
        timing: JSON.stringify(c.timing ?? {}),
      })),
    ),
    ]);
  }

  public async getLatestChecksByEndpoint(
    endpointId: string,
    opts?: {
      limit?: number;
    },
  ): Promise<Check[]> {
    const params: Record<string, string> = { endpointId };

    if (opts?.limit) {
      params.limit = opts.limit.toString();
    }
    const data = await this.fetch<Check[]>("checks_by_endpoint__v1", params);

    return data
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .map((d) => ({ ...d, time: new Date(d.time).getTime() }));
  }
}

export type Check = {
  id: string;
  endpointId: string;
  latency?: number;
  regionId: string;
  status?: number;
  teamId: string;
  time: number;
  error?: string;
  body?: string;
  headers?: Record<string, string>;
  timing?: Record<string, number>;
};

export type Metric = {
  count: number;
  p50: number;
  p95: number;
  p99: number;
  errors: number;
  regionId: string;
};

export type MetricOverTime = { time: number } & Metric;
