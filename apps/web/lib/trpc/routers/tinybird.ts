import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { auth, t } from "../trpc";
import { db } from "@planetfall/db";
import { getCustomAnalytics } from "@planetfall/tinybird";

export const tinybirdRouter = t.router({
  analytics: t.procedure
    .use(auth)
    .input(
      z.object({
        endpointId: z.string(),
        since: z.number(),
        // empty means no filter => global
        regionIds: z.array(z.string()),
        granularity: z.enum(["1d", "1h"]),
        getErrors: z.boolean().optional(),
        getCount: z.boolean().optional(),
        getP75: z.boolean().optional(),
        getP90: z.boolean().optional(),
        getP95: z.boolean().optional(),
        getP99: z.boolean().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const endpoint = await db.endpoint.findFirst({
        where: {
          AND: {
            id: input.endpointId,
            deletedAt: null,
            team: {
              members: {
                some: {
                  userId: ctx.user.id,
                },
              },
            },
          },
        },
      });

      if (!endpoint) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      return await getCustomAnalytics({
        endpointId: input.endpointId,
        since: input.since,
        regionIds: input.regionIds.join(","),
        getCount: input.getCount || undefined,
        getErrors: input.getErrors || undefined,
        getP75: input.getP75 || undefined,
        getP90: input.getP90 || undefined,
        getP95: input.getP95 || undefined,
        getP99: input.getP99 || undefined,
        granularity: input.granularity,
      });
    }),
});
