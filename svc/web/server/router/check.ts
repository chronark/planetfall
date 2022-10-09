import { newId } from "@planetfall/id";
import { TRPCError } from "@trpc/server";
import { string, z } from "zod";
import { t } from "../trpc";
import { Kafka } from "@upstash/kafka";

export const checkRouter = t.router({
  list: t.procedure.input(z.object({
    endpointId: z.string(),
    since: z.number().optional(),
    take: z.number().optional(),
    order: z.enum(["asc", "desc"]).optional(),
    regionId: z.string().optional(),
  })).query(async ({ input, ctx }) => {
    if (!ctx.req.session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const where = {};
    if (input.since) {
      // @ts-ignore
      where["time"] = {
        gte: new Date(input.since),
      };
    }

    if (input.regionId) {
      // @ts-ignore
      where["regionId"] = input.regionId;
    }
    const endpoint = await ctx.db.endpoint.findUnique({
      where: {
        id: input.endpointId,
      },
      include: {
        team: {
          include: {
            members: {
              where: {
                userId: ctx.req.session.user.id,
              },
            },
          },
        },
        checks: {
          take: input.take,
          orderBy: {
            time: input.order,
          },
          where,
        },
      },
    });
    if (!endpoint) {
      throw new TRPCError({ code: "NOT_FOUND", message: "endpoint not found" });
    }
    return endpoint.checks;
  }),
});
