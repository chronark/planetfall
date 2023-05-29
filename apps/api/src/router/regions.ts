import type { Router } from ".";
import { errorResponses } from "../errors";
import { Response } from "fets";
import { z } from "zod";

export const createV1Regions = (router: Router) =>
  router.route({
    method: "GET",
    path: "/v1/regions",
    schemas: {
      responses: {
        ...errorResponses,
        200: z
          .array(
            z.object({
              id: z.string().describe("The region's internal planetfall id"),
              platform: z
                .enum(["fly", "aws", "vercelEdge"])
                .describe(
                  "The platform the region is hosted on. We use different cloud providers to offer as many regions as possible.",
                ),
              region: z.string().describe("The region's name according to the cloud provider"),
              lat: z.number().nullable().describe("The region's latitude"),
              lon: z.number().nullable().describe("The region's longitude"),
            }),
          )
          .describe("Returns a list of all regions that are currently available"),
      },
    } as const,
    handler: async (_req, ctx) => {
      const regions = await ctx.db
        .selectFrom("Region")
        .select("Region.id")
        .select("Region.platform")
        .select("Region.region")
        .select("Region.lat"),
        .select("Region.lon")
        .where("Region.visible", "=", 1)
        .execute();

      return Response.json(regions, {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      });
    },
  });
