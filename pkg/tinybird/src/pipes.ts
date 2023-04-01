import { Tinybird } from "./base";
import { z } from "zod";

export const tb = new Tinybird();

const nullableNumberWithDefault = z
  .number()
  .nullable()
  .optional()
  .transform((v) => (typeof v === "number" ? v : 0));

export const getEndpointStats = tb.buildPipe({
  pipe: "get_endpoint_stats__v2",
  parameters: z.object({
    endpointId: z.string(),
    days: z.number().default(1)
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
  })
})

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
  })
})



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
    days: z.number().default(1)
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
    count: z.number().optional(),
    p75: z.number().optional(),
    p90: z.number().optional(),
    p95: z.number().optional(),
    p99: z.number().optional(),
    errors: z.number().optional(),
  }),
});
