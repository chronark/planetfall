import { auth, t } from "../trpc";
import { createInvoice } from "@/lib/billing/stripe";
import highstorm from "@highstorm/client";
import { db } from "@planetfall/db";
import { Email } from "@planetfall/emails";
import { newId } from "@planetfall/id";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { DEFAULT_QUOTA } from "plans";
import slugify from "slugify";
import { z } from "zod";
// import { Email } from "@planetfall/emails";

export const teamRouter = t.router({
  create: t.procedure
    .use(auth)
    .input(
      z.object({
        name: z.string(),
        slug: z.string().optional(),
        trial: z.boolean(),
        plan: z.enum(["FREE", "PRO", "ENTERPRISE"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
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
      if (user.teams.filter((t) => t.role === "OWNER").length >= 20) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only own 20 teams, please contact support@planetfall.io",
        });
      }
      const teamId = newId("team");

      const team = await db.team
        .create({
          data: {
            id: teamId,
            name: input.name,
            slug: input.slug ?? slugify(input.name, { lower: true }),
            trialExpires: input.trial ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : undefined,
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
            plan: input.plan,
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
      highstorm("team.create", {
        event: `${team.name} was created`,
        metadata: {
          actorId: ctx.user.id,
          slug: team.slug,
          resourceId: team.id,
          source: "trpc",
        },
      });

      return team;
    }),
  createInvitation: t.procedure
    .use(auth)
    .input(
      z.object({
        teamId: z.string(),
        email: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
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
      const currentUser = team.members.find((m) => m.userId === ctx.user?.id);
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
      highstorm("invitation.created", {
        event: `${invitedUser.name} was invited to ${team.name}`,
        metadata: {
          actorId: ctx.user.id,
          event: "invitation.create",
          resourceId: invitation.id,
          source: "trpc",
        },
      });

      await new Email().sendTeamInvitation({
        to: invitedUser.email,
        username: invitedUser.name,
        team: team.name,
        invitedFrom: currentUser.user.name,
        inviteLink: `https://planetfall.io/invite/${invitation.id}`,
      });
    }),
  updateMember: t.procedure
    .use(auth)
    .input(
      z.object({
        teamId: z.string(),
        userId: z.string(),
        role: z.enum(["ADMIN", "MEMBER"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
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
      const currentUser = team.members.find((m) => m.userId === ctx.user?.id);
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
      highstorm("team.membership.updated", {
        event: `${team.name} has invited ${input.userId} to join as ${input.role}`,
        metadata: {
          actorId: ctx.user.id,
          event: "team.update",
          resourceId: team.id,
          source: "trpc",
          invited: input.userId,
        },
      });
    }),
  removeMember: t.procedure
    .use(auth)
    .input(
      z.object({
        teamId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
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

      const currentUser = team.members.find((m) => m.userId === ctx.user?.id);
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
      highstorm("team.membership.updated", {
        event: `${team.name} has removed ${input.userId}`,
        metadata: {
          actorId: ctx.user.id,
          event: "team.update",
          resourceId: team.id,
          source: "trpc",
        },
      });
    }),
  delete: t.procedure
    .use(auth)
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
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

      if (team.members.find((m) => m.userId === ctx.user?.id)?.role !== "OWNER") {
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
      highstorm("team.deleted", {
        event: `${team.name} has been deleted`,
        metadata: {
          actorId: ctx.user.id,
          event: "team.delete",
          resourceId: team.id,
          source: "trpc",
        },
      });
    }),
  updateName: t.procedure
    .use(auth)
    .input(
      z.object({
        teamId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
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
      highstorm("team.updated", {
        event: `${team.name} has been renamed to ${input.name}`,
        metadata: {
          actorId: ctx.user.id,
          event: "team.update",
          resourceId: team.id,
          source: "trpc",
        },
      });
    }),
  updateSlug: t.procedure
    .use(auth)
    .input(
      z.object({
        teamId: z.string(),
        slug: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
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
      highstorm("team.updated", {
        event: `${team.name} has been renamed to ${input.slug}`,
        metadata: {
          actorId: ctx.user.id,
          event: "team.update",
          resourceId: team.id,
          source: "trpc",
        },
      });
    }),
});
