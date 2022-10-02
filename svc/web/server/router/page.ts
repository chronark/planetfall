import { newId } from "@planetfall/id";
import { TRPCError } from "@trpc/server";
import { string, z } from "zod";
import { t } from "../trpc";
import { Kafka } from "@upstash/kafka";

export const pageRouter = t.router({
  create: t.procedure.input(z.object({
    name: z.string(),
    slug: z.string(),
    endpointIds: z.array(z.string()),
    teamSlug: z.string(),
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.req.session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.req.session.user.id,
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
    // TODO: check if endpoints belong to team
    const page = await ctx.db.statusPage.create({
      data: {
        id: newId("page"),
        name: input.name,
        slug: input.slug,
        endpoints: {
          connect: input.endpointIds.map((id) => ({ id })),
        },
        team: {
          connect: {
            id: team.id,
          },
        },
      },
    });
    return page;
  }),

  delete: t.procedure.input(z.object({
    pageId: z.string(),
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.req.session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    console.time("findUser");
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.req.session?.user?.id,
      },
      include: {
        teams: {
          include: {
            team: {
              include: {
                statusPages: {
                  where: {
                    id: input.pageId,
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
        t.team.statusPages.find((e) => e.id === input.pageId)
      )
    ) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Endpoint not found" });
    }
    console.time("deleteStatusPage");
    await ctx.db.statusPage.delete({
      where: {
        id: input.pageId,
      },
    });
    console.timeEnd("deleteStatusPage");

    return;
  }),
  list: t.procedure.input(z.object({
    teamSlug: z.string(),
  })).query(async ({ input, ctx }) => {
    if (!ctx.req.session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.req.session?.user?.id,
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

    return await ctx.db.statusPage.findMany({
      where: {
        teamId: team.id,
      },
    });
  }),
  get: t.procedure.input(z.object({
    pageId: z.string(),
  })).query(async ({ input, ctx }) => {
    if (!ctx.req.session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return await ctx.db.statusPage.findUnique({
      where: {
        id: input.pageId,
      },
      include: {
        endpoints: true,
      },
    });
  }),
});
