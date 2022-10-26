import { newId } from "@planetfall/id";
import { TRPCError } from "@trpc/server";
import { string, z } from "zod";
import { t } from "../trpc";
import { Kafka } from "@upstash/kafka";
import Stripe from "stripe";

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
    const now = new Date();
    const startOfMonth = new Date(now.getUTCFullYear(), now.getUTCMonth());

    const usage = await ctx.db.check.count({
      where: {
        time: {
          gte: team.stripeCurrentBillingPeriodStart ?? startOfMonth,
        },
        endpoint: {
          teamId: input.teamId,
        },
      },
    });

    return { usage };
  }),
  checkout: t.procedure.input(
    z.object({
      teamId: z.string(),
      returnUrl: z.string(),
      plan: z.enum(["PERSONAL", "PRO"]),
    }),
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

    let productId: string | undefined = undefined;
    switch (input.plan) {
      case "PERSONAL":
        productId = process.env.STRIPE_PRODUCT_ID_PERSONAL;
        break;
      case "PRO":
        productId = process.env.STRIPE_PRODUCT_ID_PRO;
        break;
    }
    if (!productId) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "unable to load productId",
      });
    }

    const plan = await stripe.products.retrieve(productId);
    const price = plan.default_price?.toString();
    if (!price) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "plan has no default price",
      });
    }

    const { url } = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: team.stripeCustomerId,
      customer_update: {
        address: "auto",
      },
      line_items: [{
        price,
      }],
      success_url: input.returnUrl,
      cancel_url: input.returnUrl,
    });

    return { url };
  }),
  cancel: t.procedure.input(
    z.object({ teamId: z.string() }),
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
      include: {
        members: true,
        endpoints: true,
      },
    });
    if (!team) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const member = team.members.find((m) =>
      m.userId === ctx.req.session.user!.id
    );
    if (!member) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "user does not belong to team",
      });
    }
    if (member.role !== "OWNER" && member.role !== "ADMIN") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "user does not have permission to cancel subscription",
      });
    }

    if (!team.stripeSubscriptionId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "user does not have a subscription",
      });
    }

    if (
      !team.stripeCurrentBillingPeriodStart ||
      !team.stripeCurrentBillingPeriodEnd
    ) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "team does not have billing period data",
      });
    }

    const sub = await stripe.subscriptions.retrieve(team.stripeSubscriptionId);

    const itemId = sub.items.data.find((i) =>
      i.object === "subscription_item" && i.plan.active
    )?.id;
    if (!itemId) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "unable to find subscription item id",
      });
    }

    const usage = await ctx.db.check.count({
      where: {
        endpoint: {
          teamId: team.id,
        },
        time: {
          gte: team.stripeCurrentBillingPeriodStart!,
          lte: team.stripeCurrentBillingPeriodEnd!,
        },
      },
    });
    await stripe.subscriptionItems.createUsageRecord(itemId, {
      quantity: usage,
      action: "set",
    });

    await stripe.subscriptions.cancel(team.stripeSubscriptionId, {
      prorate: true,
      invoice_now: true,
    });
  }),
});
