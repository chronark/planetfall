import { Endpoint, PrismaClient, Region } from "@planetfall/db";
import { newId } from "@planetfall/id";
import { Logger } from "./logger";
import Stripe from "stripe";

export class Billing {
  // Map of endpoint id -> clearInterval function
  private db: PrismaClient;
  private logger: Logger;
  private stripe: Stripe;

  constructor(
    { logger, stripeSecretKey }: { logger: Logger; stripeSecretKey: string },
  ) {
    logger.info("Billing enabled");
    this.stripe = new Stripe(stripeSecretKey, {
      typescript: true,
      apiVersion: "2022-08-01",
    });
    this.db = new PrismaClient();
    this.logger = logger;
  }

  public async run(): Promise<void> {
    this.logger.info("Collecting billing information");

    const teams = await this.db.team.findMany({
      where: {
        stripeSubscriptionId: {
          not: null,
        },
      },
    });
    this.logger.info("Collecting billing", {
      teams: teams.length,
    });

    for (const t of teams) {
      const usage = await this.db.check.count({
        where: {
          time: {
            gte: t.stripeCurrentBillingPeriodStart!,
            lte: t.stripeCurrentBillingPeriodEnd!,
          },
          endpoint: {
            teamId: t.id,
          },
        },
      });
      this.logger.info("Team usage report", {
        teamId: t.id,
        plan: t.plan,
        usage,
        billingPeriodStart: t.stripeCurrentBillingPeriodStart,
        billingPeriodEnd: t.stripeCurrentBillingPeriodEnd,
      });

      const sub = await this.stripe.subscriptions.retrieve(
        t.stripeSubscriptionId!,
      );

      const itemId = sub.items.data.find((i) =>
        i.object === "subscription_item" && i.plan.active
      )?.id;
      if (!itemId) {
        this.logger.error("unable to find subscription item id", {
          teamId: t.id,
        });
        continue;
      }

      await this.stripe.subscriptionItems.createUsageRecord(itemId, {
        quantity: usage,
        action: "set",
      });
    }
  }
}
