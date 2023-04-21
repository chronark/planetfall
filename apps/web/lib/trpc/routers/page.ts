import { newId } from "@planetfall/id";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { auth, t } from "../trpc";
import { db } from "@planetfall/db";
import { audit } from "@planetfall/audit";

export const pageRouter = t.router({
  create: t.procedure
    .use(auth)
    .input(
      z.object({
        name: z.string(),
        slug: z.string(),
        endpointIds: z.array(z.string()).min(1),
        teamId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const team = await db.team.findUnique({
        where: { id: input.teamId },
        select: {
          id: true,
          maxTimeout: true,
          maxPages: true,
          _count: {
            select: {
              pages: true,
            },
          },
          members: {
            select: {
              userId: true,
              role: true,
            },
          },
        },
      });
      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "endpoint not found",
        });
      }

      if (team._count.pages >= (team.maxPages ?? 5)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have reached your endpoint limit",
        });
      }

      if (!team.members.some((m) => m.userId === ctx.user!.id)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      const page = await db.statusPage.create({
        data: {
          id: newId("page"),
          name: input.name,
          slug: input.slug,
          teamId: input.teamId,
          endpoints: {
            connect: input.endpointIds.map((id) => ({ id })),
          },
        },
      });
      audit.log({
        actorId: ctx.user.id,
        event: "page.create",
        resourceId: page.id,
        source: "trpc",
      });
      return page;
    }),
  update: t.procedure
    .use(auth)
    .input(
      z.object({
        pageId: z.string(),
        name: z.string().optional(),
        slug: z.string().optional(),
        endpointIds: z.array(z.string()).min(1).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const page = await db.statusPage.findUnique({
        where: { id: input.pageId },
        include: { team: { include: { members: true } } },
      });
      if (!page) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "page not found",
        });
      }

      if (!page.team.members.some((m) => m.userId === ctx.user!.id)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      const updated = await db.statusPage.update({
        where: { id: input.pageId },
        data: {
          name: input.name,
          slug: input.slug,
          endpoints: {
            set: input.endpointIds?.map((id) => ({
              id,
            })),
          },
        },
      });
      audit.log({
        actorId: ctx.user.id,
        event: "page.update",
        resourceId: updated.id,
        source: "trpc",
      });
      return updated;
    }),

  delete: t.procedure
    .use(auth)
    .input(
      z.object({
        pageId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const page = await db.statusPage.findUnique({
        where: { id: input.pageId },
        include: { team: { include: { members: true } } },
      });
      if (!page) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "page not found",
        });
      }

      if (!page.team.members.some((m) => m.userId === ctx.user!.id)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      const deleted = await db.statusPage.delete({
        where: { id: input.pageId },
      });

      audit.log({
        actorId: ctx.user.id,
        event: "page.delete",
        resourceId: deleted.id,
        source: "trpc",
      });
      return deleted;
    }),
});
