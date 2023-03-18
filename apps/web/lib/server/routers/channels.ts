import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { t } from "../trpc";
import { db } from "@planetfall/db";
import { newId } from "@planetfall/id";

export const channelsRouter = t.router({
  createEmail: t.procedure
    .input(
      z.object({
        teamId: z.string(),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const team = await db.team.findUnique({
        where: { id: input.teamId },
        include: {
          members: {
            where: {
              userId: ctx.user.id,
            },
          },
        },
      });

      if (!team) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (!team.members.find((m) => m.userId === ctx.user.id)) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      return await db.emailChannel.create({
        data: {
          id: newId("channel"),
          teamId: input.teamId,
          email: input.email,
          active: true,
        },
      });
    }),
  updateEmail: t.procedure
    .input(
      z.object({
        channelId: z.string(),
        email: z.string().email().optional(),
        active: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const channel = await db.emailChannel.findUnique({
        where: {
          id: input.channelId,
        },
        include: {
          team: {
            include: {
              members: true,
            },
          },
        },
      });

      if (!channel) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (!channel.team.members.find((m) => m.userId === ctx.user.id)) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      return await db.emailChannel.update({
        where: {
          id: input.channelId,
        },
        data: {
          email: input.email,
          active: input.active,
        },
      });
    }),
  deleteEmail: t.procedure
    .input(
      z.object({
        channelId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const channel = await db.emailChannel.findUnique({
        where: {
          id: input.channelId,
        },
        include: {
          team: {
            include: {
              members: true,
            },
          },
        },
      });

      if (!channel) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (!channel.team.members.find((m) => m.userId === ctx.user.id)) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      return await db.emailChannel.delete({
        where: {
          id: input.channelId,
        },
      });
    }),
});
