import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { t } from "../trpc";
import { db } from "@planetfall/db";
import { newId } from "@planetfall/id";
import highstorm from "@highstorm/client";

export const alertsRouter = t.router({
  create: t.procedure
    .input(
      z.object({
        teamId: z.string(),
        endpointIds: z.array(z.string()),
        channelId: z.string().optional(),
        email: z.string().email().optional(),
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
            include: {
              user: true,
            },
          },
          endpoints: true,
          alerts: {
            include: {
              emailChannels: true,
            },
          },
        },
      });

      if (!team) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const user = team.members.find((m) => m.userId === ctx.user.id);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }
      for (const endpointId of input.endpointIds) {
        if (!team.endpoints.find((e) => e.id === endpointId)) {
          throw new TRPCError({
            code: "NOT_FOUND",
          });
        }
      }
      const email = input.email ?? user.user.email;

      const alert = await db.alert.create({
        data: {
          id: newId("alert"),
          teamId: input.teamId,
          active: true,
          addNewEndpointsAutomatically: false,
          emailChannels: {
            connectOrCreate: {
              where: {
                teamId_email: {
                  teamId: team.id,
                  email,
                },
              },
              create: {
                id: newId("channel"),
                active: true,
                email,
                teamId: team.id,
              },
            },
          },
          endpoints: {
            connect: input.endpointIds.map((id) => ({ id })),
          },
        },
      });
      await highstorm("alert.created", {
        event: `${user.user.name} created an alert in ${team.slug}`,
        metadata: {
          userId: user.userId,
          teamId: user.teamId,
          teamSlug: team.slug,
        },
      });
      return alert;
    }),
  update: t.procedure
    .input(
      z.object({
        alertId: z.string(),
        active: z.boolean().optional(),
        endpointIds: z.array(z.string()).min(1).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const alert = await db.alert.findUnique({
        where: {
          id: input.alertId,
        },
        include: {
          team: {
            include: {
              members: true,
            },
          },
        },
      });

      if (!alert) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This is not the alert you're looking for",
        });
      }
      if (!alert.team.members.find((m) => m.userId === ctx.user.id)) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      const updated = await db.alert.update({
        where: {
          id: input.alertId,
        },
        data: {
          active: input.active,
          endpoints: {
            set: input.endpointIds?.map((id) => ({
              id,
            })),
          },
        },
      });

      highstorm("alert.updated", {
        event: `Alert ${alert.id} was updated`,
        metadata: {
          alertId: alert.id,
          teamId: alert.team.id,
          teamSlug: alert.team.slug,
        },
      });
      return updated;
    }),
  delete: t.procedure
    .input(
      z.object({
        alertId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const alert = await db.alert.findUnique({
        where: {
          id: input.alertId,
        },
        include: {
          team: {
            include: {
              members: true,
            },
          },
        },
      });

      if (!alert) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (!alert.team.members.find((m) => m.userId === ctx.user.id)) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      const deleted = await db.alert.delete({
        where: {
          id: input.alertId,
        },
      });
      highstorm("alert.deleted", {
        event: `Alert ${deleted.id} was deleted`,
        metadata: {
          alertId: alert.id,
          teamId: alert.team.id,
          teamSlug: alert.team.slug,
        },
      });

      return deleted;
    }),
});
