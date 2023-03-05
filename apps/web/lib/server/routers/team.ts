import { newId } from "@planetfall/id";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { t } from "../trpc";
import { db } from "@planetfall/db";
import slugify from "slugify";
import { DEFAULT_QUOTA } from "plans";
import { createInvoice } from "@/lib/billing/stripe";
import { Email } from "@planetfall/emails";

export const teamRouter = t.router({
  create: t.procedure
    .input(
      z.object({
        teamName: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const user = await db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      });
      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const teamId = newId("team");

      const team = await db.team.create({
        data: {
          id: teamId,
          name: input.teamName,
          slug: slugify(input.teamName, { lower: true }),
          trialExpires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          members: {
            create: {
              user: {
                connect: {
                  id: ctx.session.user.id,
                },
              },
              role: "OWNER",
            },
          },
          maxEndpoints: DEFAULT_QUOTA.PRO.maxEndpoints,
          maxMonthlyRequests: DEFAULT_QUOTA.PRO.maxMonthlyRequests,
          maxTimeout: DEFAULT_QUOTA.PRO.maxTimeout,
          plan: "PRO",
        },
      });

      return team;
    }),
  createInvitation: t.procedure
    .input(
      z.object({
        teamId: z.string(),
        email: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const team = await db.team.findUnique({
        where: {
          id: input.teamId,
        },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      });
      if (!team) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const currentUser = team.members.find((m) => m.userId === ctx.session!.user.id);
      if (!currentUser) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      if (currentUser.role !== "OWNER" && currentUser.role !== "ADMIN") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const invitedUser = await db.user.findUnique({
        where: {
          email: input.email,
        },
      });
      if (!invitedUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No user found: ${input.email}`,
        });
      }

      const invitation = await db.teamInvitation.upsert({
        where: {
          teamId_userId: {
            teamId: input.teamId,
            userId: invitedUser.id,
          },
        },
        update: {
          // extend the invitation
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        },
        create: {
          id: newId("invitation"),
          team: {
            connect: {
              id: input.teamId,
            },
          },
          user: {
            connect: {
              id: invitedUser.id,
            },
          },
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        },
      });

      await new Email().sendTeamInvitation({
        to: invitedUser.email,
        username: invitedUser.name,
        team: team.name,
        invitedFrom: currentUser.user.name,

        inviteLink: `https://planetfall/invite/${invitation.id}`,
      });
    }),
  updateMember: t.procedure
    .input(
      z.object({
        teamId: z.string(),
        userId: z.string(),
        role: z.enum(["ADMIN", "MEMBER"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const team = await db.team.findUnique({
        where: {
          id: input.teamId,
        },
        include: {
          members: true,
        },
      });
      if (!team) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const currentUser = team.members.find((m) => m.userId === ctx.session!.user.id);
      if (!currentUser) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      if (currentUser.role !== "OWNER" && currentUser.role !== "ADMIN") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await db.membership.upsert({
        where: {
          userId_teamId: {
            userId: input.userId,
            teamId: input.teamId,
          },
        },
        update: {
          role: input.role,
        },
        create: {
          teamId: input.teamId,
          userId: input.userId,
          role: input.role,
        },
      });
    }),
  removeMember: t.procedure
    .input(
      z.object({
        teamId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const team = await db.team.findUnique({
        where: {
          id: input.teamId,
        },
        include: {
          members: true,
        },
      });
      if (!team) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (team.members.length === 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't remove the last member of a team",
        });
      }

      const currentUser = team.members.find((m) => m.userId === ctx.session!.user.id);
      if (!currentUser) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const memberToRemove = team.members.find((m) => m.userId === input.userId);
      if (!memberToRemove) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      switch (currentUser.role) {
        case "OWNER":
          await db.membership.delete({
            where: {
              userId_teamId: { userId: input.userId, teamId: input.teamId },
            },
          });
          break;
        case "ADMIN":
          if (memberToRemove.role === "OWNER") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "You can't remove the owner of a team",
            });
          }
          await db.membership.delete({
            where: {
              userId_teamId: { userId: input.userId, teamId: input.teamId },
            },
          });
          break;
        default:
          throw new TRPCError({ code: "UNAUTHORIZED" });
      }
    }),
  delete: t.procedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const team = await db.team.findUnique({
        where: {
          id: input.teamId,
        },
        include: {
          members: true,
        },
      });
      if (!team) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (team.members.find((m) => m.userId === ctx.session!.user.id)?.role !== "OWNER") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (team.stripeCustomerId) {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = now.getUTCMonth() + 1; // current month

        await createInvoice({ team, year, month });
      }
      await db.team.delete({
        where: { id: input.teamId },
      });
    }),
});
