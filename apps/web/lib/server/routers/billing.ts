import { newId } from "@planetfall/id";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { t } from "../trpc";
import { db } from "@planetfall/db";
import Stripe from "stripe";
import { Redis } from "@upstash/redis";
import { createInvoice } from "@/lib/billing/stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
  typescript: true,
});

const redis = Redis.fromEnv();

export const billingRouter = t.router({
  setup: t.procedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      let team = await db.team.findUnique({
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

      if (!team.stripeCustomerId) {
        const user = await db.user.findUnique({
          where: { id: ctx.user.id },
        });
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const customer = await stripe.customers.create({
          email: user.email,
          name: team.name,
        });

        team = await db.team.update({
          where: { id: team.id },
          data: {
            trialExpires: null,
            stripeCustomerId: customer.id,
          },
          include: {
            members: {
              where: {
                userId: ctx.user.id,
              },
            },
          },
        });
      }
      console.log({ team });
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: team.stripeCustomerId!, // we just created it, so we know it exists
        mode: "setup",
        payment_method_types: ["card"],
        success_url: ctx.req.headers.referer ?? "https://planetfall.io/home",
        cancel_url: ctx.req.headers.referer ?? "https://planetfall.io/home",
      });

      return { url: checkoutSession.url };
    }),
  changePlan: t.procedure
    .input(
      z.object({
        teamId: z.string(),
        plan: z.enum(["FREE", "PRO", "ENTERPRISE"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
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
          message: "You can only change your plan once a day",
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
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      let team = await db.team.findUnique({
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

      const portal = await stripe.billingPortal.sessions.create({
        customer: team.stripeCustomerId!,
        return_url: ctx.req.headers.referer ?? "https://planetfall.io/home",
      });

      return { url: portal.url };
    }),
});
