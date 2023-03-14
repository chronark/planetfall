import { newId } from "@planetfall/id";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { t } from "../trpc";
import { db } from "@planetfall/db";
import slugify from "slugify";
import { DEFAULT_QUOTA } from "plans";
import { createInvoice } from "@/lib/billing/stripe";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
// import { Email } from "@planetfall/emails";

export const teamRouter = t.router({
  create: t.procedure
    .input(
      z.object({
        name: z.string(),
        slug: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const user = await db.user.findUnique({
        where: {
          id: ctx.user.id,
        },
        include: {
          teams: true,
        },
      });
      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      if (user.teams.filter((t) => t.role === "OWNER").length >= 3) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only own 3 teams, please contact support@planetfall.io",
        });
      }
      const teamId = newId("team");

      const team = await db.team
        .create({
          data: {
            id: teamId,
            name: input.name,
            slug: input.slug ?? slugify(input.name, { lower: true }),
            trialExpires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            members: {
              create: {
                user: {
                  connect: {
                    id: ctx.user.id,
                  },
                },
                role: "OWNER",
              },
            },
            maxEndpoints: DEFAULT_QUOTA.FREE.maxEndpoints,
            maxMonthlyRequests: DEFAULT_QUOTA.FREE.maxMonthlyRequests,
            maxPages: DEFAULT_QUOTA.FREE.maxStatusPages,
            maxTimeout: DEFAULT_QUOTA.FREE.maxTimeout,
            plan: "FREE",
          },
        })
        .catch((err) => {
          if (err instanceof PrismaClientKnownRequestError) {
            if (err.code === "P2002") {
              throw new TRPCError({
                code: "CONFLICT",
                message: `Team with slug "${input.slug}" already exists`,
              });
            }
          }
          throw err;
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
      if (!ctx.user.id) {
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
      if (team.plan === "FREE") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Upgrade to PRO to invite members to this team",
        });
      }
      if (team.plan === "DISABLED") {
        throw new TRPCError({ code: "FORBIDDEN", message: "This team has been disabled" });
      }
      const currentUser = team.members.find((m) => m.userId === ctx.user!.id);
      if (!currentUser) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      if (currentUser.role !== "OWNER" && currentUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You need to be an admin or owner of this team.",
        });
      }

      const invitedUser = await db.user.findUnique({
        where: {
          email: input.email,
        },
      });
      if (!invitedUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No user found: ${input.email}. Please ask them to sign up first.`,
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
      return invitation;

      // await new Email().sendTeamInvitation({
      //   to: invitedUser.email,
      //   username: invitedUser.name,
      //   team: team.name,
      //   invitedFrom: currentUser.user.name,

      //   inviteLink: `https://planetfall/invite/${invitation.id}`,
      // });
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
      if (!ctx.user.id) {
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
      const currentUser = team.members.find((m) => m.userId === ctx.user!.id);
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
      if (!ctx.user.id) {
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

      const currentUser = team.members.find((m) => m.userId === ctx.user!.id);
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
      if (!ctx.user.id) {
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

      if (team.members.find((m) => m.userId === ctx.user!.id)?.role !== "OWNER") {
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
  updateName: t.procedure
    .input(
      z.object({
        teamId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const team = await db.team.findFirst({
        where: {
          id: input.teamId,
          members: {
            some: {
              userId: ctx.user.id,
              role: {
                in: ["OWNER", "ADMIN"],
              },
            },
          },
        },
      });
      if (!team) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await db.team
        .update({
          where: {
            id: input.teamId,
          },
          data: {
            name: input.name,
          },
        })
        .catch((e) => {
          if (e instanceof PrismaClientKnownRequestError && e.code === "P2002") {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Team name already taken" });
          }
        });
    }),
  updateSlug: t.procedure
    .input(
      z.object({
        teamId: z.string(),
        slug: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const team = await db.team.findFirst({
        where: {
          id: input.teamId,
          members: {
            some: {
              userId: ctx.user.id,
              role: {
                in: ["OWNER", "ADMIN"],
              },
            },
          },
        },
      });
      if (!team) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await db.team
        .update({
          where: {
            id: input.teamId,
          },
          data: {
            slug: input.slug,
          },
        })
        .catch((e) => {
          if (e instanceof PrismaClientKnownRequestError && e.code === "P2002") {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Team slug already taken" });
          }
        });
    }),
});
