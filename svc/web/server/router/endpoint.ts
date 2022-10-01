import { newId } from "@planetfall/id";
import { TRPCError } from "@trpc/server";
import { string, z } from "zod";
import { t } from "../trpc";
import { Kafka } from "@upstash/kafka";

export const endpointRouter = t.router({
  create: t.procedure.input(z.object({
    method: z.enum(["POST", "GET", "PUT", "DELETE"]),
    url: z.string().url(),
    headers: z.record(z.string()).optional(),
    body: z.string().optional(),
    degradedAfter: z.number().int().positive().optional(),
    failedAfter: z.number().int().positive(),
    teamSlug: z.string(),
    interval: z.number().int().gte(1).lte(60 * 60),
    regions: z.array(z.string()),
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.auth.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.auth.userId,
      },
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "user not found" });
    }
    const team = user.teams.find((t) => t.team.name === input.teamSlug)?.team;
    if (!team) {
      throw new TRPCError({ code: "NOT_FOUND", message: "team not found" });
    }
    console.log(JSON.stringify({ input }, null, 2));

    const endpoint = await ctx.db.endpoint.create({
      data: {
        id: newId("endpoint"),
        url: input.url,
        body: input.body,
        headers: input.headers,
        active: true,
        method: input.method,
        interval: input.interval,
        degradedAfter: input.degradedAfter,
        failedAfter: input.failedAfter,
        regions: {
          connect: input.regions.map((id) => ({ id })),
        },
        team: {
          connect: {
            id: team.id,
          },
        },
      },
    });

    const kafka = new Kafka({
      url: "https://usable-snipe-5277-eu1-rest-kafka.upstash.io",
      username:
        "dXNhYmxlLXNuaXBlLTUyNzckgQzcA6IYQ332mfG8_U4caCkdWR-tgVvgXep9ACs",
      password:
        "baAtrzV9P0xqkhmSSJlN9woFhKOOuYqeYc8L7E_l7pS4yBxDEWks06jfdNYkFPwSKq9A2A==",
    });

    const p = kafka.producer();

    const r = await p.produce("endpoint.created", { endpointId: endpoint.id });
    console.log("Kafka response:", r);
    return endpoint;
  }),
  delete: t.procedure.input(z.object({
    endpointId: z.string(),
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.auth.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    console.time("findUser");
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.auth.userId,
      },
      include: {
        teams: {
          include: {
            team: {
              include: {
                endpoints: {
                  where: {
                    id: input.endpointId,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "user not found" });
    }
    console.timeEnd("findUser");

    if (
      !user.teams.find((t) =>
        t.team.endpoints.find((e) => e.id === input.endpointId)
      )
    ) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Endpoint not found" });
    }
    console.time("deleteEndpoint");
    await ctx.db.endpoint.delete({
      where: {
        id: input.endpointId,
      },
    });
    console.timeEnd("deleteEndpoint");

    const kafka = new Kafka({
      url: "https://usable-snipe-5277-eu1-rest-kafka.upstash.io",
      username:
        "dXNhYmxlLXNuaXBlLTUyNzckgQzcA6IYQ332mfG8_U4caCkdWR-tgVvgXep9ACs",
      password:
        "baAtrzV9P0xqkhmSSJlN9woFhKOOuYqeYc8L7E_l7pS4yBxDEWks06jfdNYkFPwSKq9A2A==",
    });

    const p = kafka.producer();

    await p.produce("endpoint.deleted", {
      endpointId: input.endpointId,
    });
    return;
  }),
  list: t.procedure.input(z.object({
    teamSlug: z.string(),
  })).query(async ({ input, ctx }) => {
    if (!ctx.auth.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.auth.userId,
      },
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "user not found" });
    }
    const team = user.teams.find((t) => t.team.name === input.teamSlug)?.team;
    if (!team) {
      throw new TRPCError({ code: "NOT_FOUND", message: "team not found" });
    }

    return await ctx.db.endpoint.findMany({
      where: {
        teamId: team.id,
      },
    });
  }),
  get: t.procedure.input(z.object({
    endpointId: z.string(),
    since: z.number().int().optional(),
    regionId: z.string().optional(),
  })).query(async ({ input, ctx }) => {
    if (!ctx.auth.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const checkWhere = {};
    if (input.since) {
      // @ts-ignore
      checkWhere["time"] = {
        gte: new Date(input.since),
      };
    }
    if (input.regionId) {
      // @ts-ignore
      checkWhere["regionId"] = input.regionId;
    }

    const endpoint = await ctx.db.endpoint.findUnique({
      where: {
        id: input.endpointId,
      },
      include: {
        checks: {
          orderBy: {
            time: "desc",
          },
          where: checkWhere,
        },
        team: {
          include: {
            members: {
              where: {
                userId: ctx.auth.userId,
              },
            },
          },
        },
        regions: true
      },
    });
    if (!endpoint) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Endpoint not found" });
    }
    return {
      ...endpoint,
      team: undefined,
    };
  }),
});
