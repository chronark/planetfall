import { Tinybird } from "@chronark/zod-bird";
import { z } from "zod";

export const tb = new Tinybird({ token: process.env.TINYBIRD_TOKEN! });

const nullableNumberWithDefault = z
  .number()
  .nullable()
  .optional()
  .transform((v) => (typeof v === "number" ? v : 0));

export const getEndpointStats = tb.buildPipe({
  pipe: "get_endpoint_stats__v2",
  parameters: z.object({
    endpointId: z.string(),
    days: z.number().default(1),
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

export const getEndpointMetricsOver90Days = tb.buildPipe({
  pipe: "statuspage__get_aggregated_metrics__v1",
  parameters: z.object({
    endpointIds: z.array(z.string()),
  }),
  data: z.object({
    regionId: z.string(),
    endpointId: z.string(),
    count: nullableNumberWithDefault,
    p75: nullableNumberWithDefault,
    p90: nullableNumberWithDefault,
    p95: nullableNumberWithDefault,
    p99: nullableNumberWithDefault,
    errors: nullableNumberWithDefault,
  }),
});

export const getEndpointSeriesOver90Days = tb.buildPipe({
  pipe: "statuspage__get_aggregated_series__v1",
  parameters: z.object({
    endpointIds: z.array(z.string()),
  }),
  data: z.object({
    time: z.string().transform((s) => new Date(s).getTime()),
    regionId: z.string(),
    endpointId: z.string(),
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
    days: z.number().default(1),
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

const check = z.object({
  id: z.string(),
  endpointId: z.string(),
  latency: z.number().nullable(),
  status: z.number().nullable(),
  regionId: z.string(),
  teamId: z.string(),
  time: z.string().transform((s) => new Date(s).getTime()),
  error: z.string().nullable(),
  body: z.string().nullable(),
  headers: z
    .string()
    .nullable()
    .transform((v) => (v ? (JSON.parse(v) as Record<string, string>) : null)),
  timing: z
    .string()
    .nullable()
    .transform((v) => (v ? (JSON.parse(v) as Record<string, number>) : null)),
});

export const getCheck = tb.buildPipe({
  pipe: "get_check__v1",
  parameters: z.object({
    checkId: z.string(),
  }),
  data: check,
  opts: {
    revalidate: 60 * 60 * 24, // 1 day
  },
});

export type Check = z.infer<typeof check>;

export const globalUsage = tb.buildPipe({
  pipe: "landingpage__average_usage__v1",
  data: z.object({
    usage: z.number(),
    time: z.string().transform((s) => new Date(s).getTime()),
  }),
  opts: {
    revalidate: 60 * 60 * 24, // 1 day
  },
});

export const getErrors = tb.buildPipe({
  pipe: "get_errors__v1",
  parameters: z.object({
    endpointId: z.string(),
    since: z.number(),
  }),
  data: z.object({
    id: z.string(),
    time: z.string().transform((s) => new Date(s).getTime()),
    status: nullableNumberWithDefault,
    regionId: z.string(),
    error: z.string(),
    latency: nullableNumberWithDefault,
  }),
});

export const getCustomAnalytics = tb.buildPipe({
  pipe: "get_custom_analytics__v1",
  parameters: z.object({
    endpointId: z.string(),
    since: z.number(),
    // comma separated regionIds
    regionIds: z.string(),
    getErrors: z.boolean().optional(),
    getCount: z.boolean().optional(),
    getP75: z.boolean().optional(),
    getP90: z.boolean().optional(),
    getP95: z.boolean().optional(),
    getP99: z.boolean().optional(),
    granularity: z.enum(["1d", "1h"]),
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

export const getLatestChecksByEndpoint = tb.buildPipe({
  pipe: "checks_by_endpoint__v1",
  parameters: z.object({
    endpointId: z.string(),
    limit: z.number().optional().default(100),
  }),
  data: check,
});

export const getLatestChecks10Minutes = tb.buildPipe({
  pipe: "api__get_latest_10m",
  parameters: z.object({
    endpointId: z.string(),
  }),
  data: check,
});
