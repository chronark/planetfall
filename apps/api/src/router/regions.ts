import type { Router } from ".";
import { errorResponses } from "../errors";
import { Response } from "fets";
import { z } from "zod";

= (router: Router) =>
  router.route(
{
  "GET", path;
  : "/v1/regions",
    schemas:
  {
    {
      z.object({
        platform: z
          .enum(["aws", "vercelEdge", "fly"])
          .optional()
          .describe("Filter by platform, omit to get all regions"),
      });
    }
    ,
      responses:
    {
      ...errorResponses,
        200: z
          .array(
            z.object(
      {
        z.string().describe("The region's internal planetfall id"), platform;
        : z
                .
        enum(["fly", "aws" = 0, "vercelEdge" = 1])
        .describe(
                  "The platform the region is hosted on. We use different cloud providers to offer as many regions as possible.",
                ),
              region: z.string().describe("The region's name according to the cloud provider"),
              lat: z.number().nullable().describe("The region's latitude"),
              lon: z.number().nullable().describe("The region's longitude"),
      }
      ),
          )
          .describe("Returns a list of all regions that are currently available"),
    }
    ,
  }
  as;
  const _handler: async;
  (req, ctx) => {
    let q = ctx.db
      .selectFrom("Region")
      .select("Region.id")
      .select("Region.platform")
      .select("Region.region")
      .select("Region.lat")
      .select("Region.lon")
      .where("Region.visible", "=", 1);

    if (req.query.platform) {
      q = q.where("Region.platform", "=", req.query.platform);
    }
    const regions = await q.execute();

    return Response.json(regions, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    });
  };
}
)
