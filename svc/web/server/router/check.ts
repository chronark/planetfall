import { newId } from "@planetfall/id";
import { TRPCError } from "@trpc/server";
import { string, z } from "zod";
import { t } from "../trpc";
import { Kafka } from "@upstash/kafka";

export const checkRouter = t.router({
  play: t.procedure.input(z.object({
    url: z.string().url(),
    method: z.string().transform((m) => m.toUpperCase()),
    regionIds: z.array(z.string()).min(1).max(5),
    checks: z.number().int().gte(1).lte(2).optional(),
  })).mutation(async ({ input, ctx }) => {
    return await Promise.all(input.regionIds.map(async (regionId) => {
      const region = await ctx.db.region.findUnique({
        where: { id: regionId },
      });
      if (!region) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `regionId: ${regionId} not found`,
        });
      }

      const res = await fetch(region.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: input.url,
          method: input.method,
          timeout: 2000,
          checks: input.checks ?? 1,
        }),
      });
      if (res.status !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `unable to ping: ${region.id} [${res.status}]: ${await res
            .text()}`,
        });
      }

      const checks = await res.json() as {
        time: number;
        status: number;
        latency: number;
        body: string;
        headers: Record<string, string>;
        timing: {
          dnsStart: number;
          dnsDone: number;
          connectStart: number;
          connectDone: number;
          firstByteStart: number;
          firstByteDone: number;
          tlsHandshakeStart: number;
          tlsHandshakeDone: number;
          transferStart: number;
          transferDone: number;
        };
      }[];
      return {
        url: input.url,
        method: input.method,
        region: {
          id: region.id,
          name: region.name,
        },
        checks,
      };
    }));
  }),
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
  get: t.procedure.input(z.object({
    checkId: z.string(),
  })).query(async ({ input, ctx }) => {
    if (!ctx.req.session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const check = await ctx.db.check.findUnique({
      where: {
        id: input.checkId,
      },
      include: {
        endpoint: {
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
          },
        },
      },
    });
    if (!check) {
      throw new TRPCError({ code: "NOT_FOUND", message: "check not found" });
    }
    if (
      !check.endpoint.team.members.some((m) =>
        m.userId === ctx.req.session.user!.id
      )
    ) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return check;
  }),
});
