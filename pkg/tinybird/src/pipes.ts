import { Tinybird } from "./base";
import { z } from "zod";

const tb = new Tinybird();

const nullableNumberWithDefault = z
  .number()
  .nullable()
  .transform((v) => (typeof v === "number" ? v : 0));

export const getEndpointStats = tb.buildPipe({
  pipe: "get_endpoint_stats__v2",
  parameters: z.object({
    endpointId: z.string(),
  }),
  data: z.object({
    regionId: z.string(),
    count: nullableNumberWithDefault,
    p75: nullableNumberWithDefault,
    p90: nullableNumberWithDefault,
    p95: nullableNumberWithDefault,
    p99: nullableNumberWithDefault,
    errors: nullableNumberWithDefault,
  }),
});

export const getEndpointStatsPerDay = tb.buildPipe({
  pipe: "get_endpoint_stats_per_day__v2",
  parameters: z.object({
    endpointId: z.string(),
    days: z.number().default(90),
  }),
  data: z.object({
    time: z.string().transform((s) => new Date(s).getTime()),
    regionId: z.string(),
    count: nullableNumberWithDefault,
    p75: nullableNumberWithDefault,
    p90: nullableNumberWithDefault,
    p95: nullableNumberWithDefault,
    p99: nullableNumberWithDefault,
    errors: nullableNumberWithDefault,
  }),
});

export const getEndpointStatsGlobally = tb.buildPipe({
  pipe: "get_endpoint_stats_globally__v2",
  parameters: z.object({
    endpointId: z.string(),
  }),
  data: z.object({
    count: nullableNumberWithDefault,
    p75: nullableNumberWithDefault,
    p90: nullableNumberWithDefault,
    p95: nullableNumberWithDefault,
    p99: nullableNumberWithDefault,
    errors: nullableNumberWithDefault,
  }),
});

export const getUsage = tb.buildPipe({
  pipe: "get_usage__v1",
  parameters: z.object({
    teamId: z.string().optional(),
    year: z.number(),
    month: z.number(),
  }),
  data: z.object({
    teamId: z.string(),
    usage: z.number(),
    year: z.number(),
    month: z.number(),
    day: z.number(),
  }),
});
