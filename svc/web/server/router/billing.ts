import { newId } from "@planetfall/id";
import { TRPCError } from "@trpc/server";
import { string, z } from "zod";
import { t } from "../trpc";
import { Kafka } from "@upstash/kafka";
import Stripe from "stripe";
import { Plan } from "@planetfall/db";
import { PlayPauseIcon } from "@heroicons/react/24/solid";

export const billingRouter = t.router({
  usage: t.procedure.input(z.object({
    teamId: z.string(),
  })).query(async ({ input, ctx }) => {
    if (!ctx.req.session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const team = await ctx.db.team.findUnique({
      where: {
        id: input.teamId,
      },
    });
    if (!team) {
      throw new TRPCError({ code: "NOT_FOUND", message: "team not found" });
    }
    const usage = await ctx.db.check.count({
      where: {
        time: {
          gte: team.stripeCurrentBillingPeriodStart ?? undefined,
        },
        endpoint: {
          teamId: input.teamId,
        },
      },
    });

    return { usage };
  }),
  checkout: t.procedure.input(
    z.object({ teamId: z.string(), returnUrl: z.string() }),
  ).mutation(async ({ input, ctx }) => {
    if (!ctx.req.session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
      apiVersion: "2022-08-01",
    });

    const team = await ctx.db.team.findUnique({
      where: {
        id: input.teamId,
      },
    });
    if (!team) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const { url } = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: team.stripeCustomerId,
      customer_update: {
        address: "auto",
      },
      line_items: [{
        price: process.env.STRIPE_PLAN_PRO_PRICE_ID,
      }],
      success_url: input.returnUrl,
      cancel_url: input.returnUrl,
    });

    return { url };
  }),
});
