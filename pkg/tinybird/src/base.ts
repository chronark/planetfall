import { z } from "zod";

type PipeErrorResponse = {
  error: string;
  documentation: string;
};

const meta = z.object({
  name: z.string(),
  type: z.string(),
});

export type Meta = z.infer<typeof meta>;

const pipeResponseWithoutData = z.object({
  meta: z.array(meta),
  rows: z.number().optional(),
  rows_before_limit_at_least: z.number().optional(),
  statistics: z
    .object({
      elapsed: z.number().optional(),
      rows_read: z.number().optional(),
      bytes_read: z.number().optional(),
    })
    .optional(),
});

export class Tinybird {
  private readonly baseUrl = "https://api.tinybird.co";
  private readonly token: string;

  constructor(token?: string) {
    token ??= process.env.TINYBIRD_TOKEN;

    if (!token) {
      throw new Error("tinybird token is missing");
    }
    this.token = token;
  }

  private async fetch(
    pipe: string,
    parameters: Record<string, string | number | boolean | string[]> = {},
  ): Promise<unknown> {
    const url = new URL(`/v0/pipes/${pipe}.json`, this.baseUrl);
    for (const [key, value] of Object.entries(parameters)) {
      if (typeof value === "undefined") {
        continue;
      }
      url.searchParams.set(key, value.toString());
    }
    // url.searchParams.set("cache_buster", Math.random().toString());
    url.searchParams.set("token", this.token);
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      //  cache: "no-store",
      // @ts-ignore
      next: {
        revalidate: 10,
      },
    });
    if (!res.ok) {
      const error = (await res.json()) as PipeErrorResponse;
      throw new Error(error.error);
    }
    const body = await res.json();

    console.log({
      now: new Date().toUTCString(),
      responseDate: res.headers.get("date"),
      url: url.toString(),
    });

    return body;
  }

  public buildPipe<
    TParameters extends Record<string, string | number | boolean | string[]>,
    TData extends Record<string, unknown>,
  >(opts: {
    pipe: string;
    parameters?: z.ZodSchema<TParameters>;
    data: z.ZodSchema<TData, any, any>;
  }): (
    params: TParameters,
  ) => Promise<z.infer<typeof pipeResponseWithoutData> & { data: TData[] }> {
    const outputSchema = pipeResponseWithoutData.setKey("data", z.array(opts.data));
    return async (params: TParameters) => {
      let validatedParams: TParameters | undefined = undefined;
      if (opts.parameters) {
        const v = opts.parameters.safeParse(params);
        if (!v.success) {
          throw new Error(v.error.message);
        }
        validatedParams = v.data;
      }

      const res = await this.fetch(opts.pipe, validatedParams);
      const validatedResponse = outputSchema.safeParse(res);
      if (!validatedResponse.success) {
        throw new Error(validatedResponse.error.message);
      }

      return validatedResponse.data;
    };
  }

  public async publish<TEvent extends Record<string, unknown>>(
    datasource: string,
    payload: TEvent | TEvent[],
  ): Promise<void> {
    const url = new URL("/v0/events", this.baseUrl);
    url.searchParams.set("name", datasource);

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
}
