import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { t } from "../trpc";
import { db } from "@planetfall/db";
import Stripe from "stripe";
import { Redis } from "@upstash/redis";
import { createInvoice } from "@/lib/billing/stripe";
import { DEFAULT_QUOTA } from "plans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
  typescript: true,
});

const redis = Redis.fromEnv();

export const billingRouter = t.router({
  changePlan: t.procedure
    .input(
      z.object({
        teamId: z.string(),
        plan: z.enum(["FREE", "PRO", "ENTERPRISE"]),
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

      const redisLockKey = ["billing", "change", "lock", team.id].join(":");
      const locked = await redis.exists(redisLockKey);
      if (locked) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message:
            "You can only change your plan once a day. If this is an emergency, please contact support@planetfall.io",
        });
      }

      if (!team.stripeCustomerId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "You must have a payment method setup to change your plan",
        });
      }
      if (team.plan === input.plan) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "You are already on this plan",
        });
      }
      if (input.plan === "FREE") {
        // Downgrading requires us to bill them for the usage up to this point
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = now.getUTCMonth();
        await createInvoice({ team, year, month });
      }

      await db.team.update({
        where: { id: team.id },
        data: {
          plan: input.plan,
          maxEndpoints: DEFAULT_QUOTA[input.plan].maxEndpoints,
          maxMonthlyRequests: DEFAULT_QUOTA[input.plan].maxMonthlyRequests,
          maxTimeout: DEFAULT_QUOTA[input.plan].maxTimeout,
          maxPages: DEFAULT_QUOTA[input.plan].maxStatusPages,
          trialExpires: null,
        },
      });
      await redis.set(redisLockKey, true, { ex: 60 * 60 * 24 });
    }),
  portal: t.procedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      let team = await db.team.findUnique({
        where: { id: input.teamId },
        include: {
          members: {
            include: {
              user: true,
            },
            where: {
              userId: ctx.user.id,
            },
          },
        },
      });

      if (!team) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (!team.stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: team.members[0].user.email,
          name: team.name,
        });

        // @ts-ignore We don't return all the fields, but we don't need them anyways
        // Fixing the type would require useless db lookups
        team = await db.team.update({
          where: {
            id: team.id,
          },
          data: {
            stripeCustomerId: customer.id,
          },
        });
      }

      const portal = await stripe.billingPortal.sessions.create({
        customer: team!.stripeCustomerId!,
        return_url: ctx.req.headers.referer ?? "https://planetfall.io/home",
      });

      return { url: portal.url };
    }),
});
