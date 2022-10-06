import { newId } from "@planetfall/id";
import { TRPCError } from "@trpc/server";
import { env } from "process";
import slugify from "slugify";
import Stripe from "stripe";
import { z } from "zod";
import Input from "../../components/form/input";
import { DEFAULT_QUOTA } from "../../plans";
import { t } from "../trpc";

export const teamRouter = t.router({
  create: t.procedure.input(z.object({
    name: z.string(),
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.req.session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.req.session.user.id,
      },
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
      apiVersion: "2022-08-01",
    });

    const customer = await stripe.customers.create({
      email: user.email,
      name: input.name,
    });
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      trial_period_days: 14,
      items: [{ price: process.env.STRIPE_PLAN_PRO_PRICE_ID }],
    });
    if (!subscription) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "unable to create subscription",
      });
    }

    return await ctx.db.team.create({
      data: {
        id: newId("team"),
        personal: false,
        plan: "PRO",
        name: input.name,
        slug: slugify(input.name, { lower: true, replacement: "_" }),
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
        stripeCurrentBillingPeriodStart: new Date(
          subscription.current_period_start * 1000,
        ),
        stripeCurrentBillingPeriodEnd: new Date(
          subscription.current_period_end * 1000,
        ),
        stripeTrialExpires: subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : null,
        retention: DEFAULT_QUOTA.PRO.retention,
        maxMonthlyRequests: DEFAULT_QUOTA.PRO.maxMonthlyRequests,
        members: {
          create: {
            user: {
              connect: {
                id: ctx.req.session.user.id,
              },
            },
            role: "OWNER",
          },
        },
      },
    });
  }),
  list: t.procedure.query(async ({ ctx }) => {
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
    return user.teams;
  }),
  get: t.procedure.input(
    z.object({
      teamId: z.string().optional(),
      teamSlug: z.string().optional(),
    }),
  ).query(async ({ input, ctx }) => {
    if (!ctx.req.session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    if (!input.teamId && !input.teamSlug) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "either teamId or teamSlug is required",
      });
    }
    const team = await ctx.db.team.findUnique({
      where: {
        id: input.teamId,
        slug: input.teamSlug,
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
      throw new TRPCError({ code: "NOT_FOUND", message: "team not found" });
    }
    if (!team.members.find((m) => m.userId === ctx.req.session.user!.id)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "you do not belong to this team",
      });
    }
    return team;
  }),
});
