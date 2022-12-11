import { db, PrismaClient } from "@planetfall/db";
import { Logger } from "./logger";
import Stripe from "stripe";
import { Client as Tinybird } from "@planetfall/tinybird";

export class Billing {
	// Map of endpoint id -> clearInterval function
	private db: PrismaClient;
	private logger: Logger;
	private stripe: Stripe;
	private tinybird: Tinybird;

	constructor({
		logger,
		stripeSecretKey,
	}: {
		logger: Logger;
		stripeSecretKey: string;
	}) {
		logger.info("Billing enabled");
		this.stripe = new Stripe(stripeSecretKey, {
			typescript: true,
			apiVersion: "2022-11-15",
		});
		this.db = db;
		this.logger = logger;
		this.tinybird = new Tinybird();
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
			try {
				const usage = await this.tinybird.getUsage(t.id, [
					Math.floor(t.stripeCurrentBillingPeriodStart!.getTime() / 1000),
					Math.floor(t.stripeCurrentBillingPeriodEnd!.getTime() / 1000),
				]);
				if (usage === 0) {
					this.logger.info("Skipping team with no usage", {
						teamId: t.id,
					});
					continue;
				}

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

				const itemId = sub.items.data.find(
					(i) => i.object === "subscription_item" && i.plan.active,
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
	} catch (e) {
				this.logger.error((e as Error).message, {
					teamId: t.id,
				});
			}
		}
	}
}
