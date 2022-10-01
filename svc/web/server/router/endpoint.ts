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
    interval: z.number().int().gte(1000).lte(30000),
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
    const endpoint = await ctx.db.endpoint.create({
      data: {
        id: newId("endpoint"),
        url: input.url,
        active: true,
        method: input.method,
        interval: input.interval,
        degradedAfter: input.degradedAfter,
        failedAfter: input.failedAfter,
        regions: {
          connect: input.regions.map((id) => ({
            id,
          })),
        },
        team: {
          connect: {
            id: team.id,
          },
        },
      },
    });

    const kafka = new Kafka({
      url: "https://guided-mayfly-5226-eu1-rest-kafka.upstash.io",
      username:
        "Z3VpZGVkLW1heWZseS01MjI2JFR6xU2xMP72Fah6nc6tJmrvjjY_4liyvXx60z4",
      password:
        "LS05fUMzOT6MD4L1n3kwRkOrAsQu-B_gtY11dLz6pNepoTORnU5Wvu5UhiDc1CEpFTi8sQ==",
    });

    const p = kafka.producer();

    const r = await p.produce("endpoint.created", { endpointId: endpoint.id });
    console.log("Kafka response:", r);
    return endpoint;
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
});
