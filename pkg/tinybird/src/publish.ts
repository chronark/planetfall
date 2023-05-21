import { Tinybird } from "@chronark/zod-bird";
import { z } from "zod";
const tb = new Tinybird({ token: process.env.TINYBIRD_TOKEN! });

export const publishCheck = tb.buildIngestEndpoint({
  datasource: "checks__v3",
  event: z.object({
    id: z.string(),
    endpointId: z.string(),
    latency: z.number().optional(),
    regionId: z.string(),
    status: z.number().optional(),
    teamId: z.string(),
    time: z.number(),
    error: z.string().optional(),
    body: z.string().optional(),
    headers: z.string().optional(),
    timing: z.string().optional(),
  }),
});
