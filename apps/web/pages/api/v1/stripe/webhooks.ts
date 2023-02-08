import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { Readable } from "node:stream";
import { PrismaClient } from "@planetfall/db";
import { z } from "zod";
import { DEFAULT_QUOTA } from "plans";

// Stripe requires the raw body to construct the event.
export const config = {
	api: {
		bodyParser: false,
	},
};

async function buffer(readable: Readable) {
	const chunks = [];
	for await (const chunk of readable) {
		chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
	}
	return Buffer.concat(chunks);
}

const relevantEvents = new Set([
	"checkout.session.completed",
	"invoice.paid",
	"invoice.payment_failed",
	"customer.subscription.deleted",
]);

const requestValidation = z.object({
	method: z.string().refine((m) => m === "POST"),
	headers: z.object({
		"stripe-signature": z.string(),
	}),
});
export default async function webhookHandler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	try {
		const {
			headers: { "stripe-signature": signature },
		} = requestValidation.parse(req);

		const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
			apiVersion: "2022-11-15",
			typescript: true,
		});

		const event = stripe.webhooks.constructEvent(
			(await buffer(req)).toString(),
			signature,
			process.env.STRIPE_WEBHOOK_SECRET!,
		);

		const db = new PrismaClient();

		switch (event.type) {
			case "customer.subscription.created":
			case "customer.subscription.updated": {
				const newSubscription = event.data.object as Stripe.Subscription;
				await db.team.update({
					where: {
						stripeCustomerId: newSubscription.customer.toString(),
					},
					data: {
						plan: "PRO",
						stripeSubscriptionId: newSubscription.id,
						maxMonthlyRequests: DEFAULT_QUOTA.PRO.maxMonthlyRequests,
						maxEndpoints: DEFAULT_QUOTA.PRO.maxEndpoints,
						maxTimeout: DEFAULT_QUOTA.PRO.maxTimeout,
						stripeCurrentBillingPeriodStart: new Date(
							newSubscription.current_period_start * 1000,
						),
						stripeCurrentBillingPeriodEnd: new Date(
							newSubscription.current_period_end * 1000,
						),
					},
				});
				break;
			}

			case "invoice.payed": {
				const invoice = event.data.object as Stripe.Invoice;
				console.log("invoice paid", invoice);
				if (!invoice.customer) {
					throw new Error("customer is null");
				}
				await db.team.update({
					where: {
						stripeCustomerId: invoice.customer.toString(),
					},
					data: {
						stripeCurrentBillingPeriodStart: new Date(),
					},
				});
				break;
			}

			case "invoice.payment_failed": {
				console.log(
					"invoice failed",
					JSON.stringify(event.data.object, null, 2),
				);
				throw new Error("TODO: Send email to user about failed invoice");
			}

			case "customer.subscription.deleted": {
				const subscription = event.data.object as Stripe.Subscription;
				console.log("subscription deleted", subscription);

				const team = await db.team.findUnique({
					where: {
						stripeCustomerId: subscription.customer.toString(),
					},
				});
				if (!team) {
					throw new Error("plan does not exist");
				}

				if (team.isPersonal) {
					await db.team.update({
						where: {
							stripeCustomerId: subscription.customer.toString(),
						},
						data: {
							plan: "FREE",
							stripeSubscriptionId: null,
							maxMonthlyRequests: DEFAULT_QUOTA.FREE.maxMonthlyRequests,
							maxEndpoints: DEFAULT_QUOTA.FREE.maxEndpoints,
							maxTimeout: DEFAULT_QUOTA.FREE.maxTimeout,
							stripeCurrentBillingPeriodStart: null,
							stripeCurrentBillingPeriodEnd: null,
						},
					});
				} else {
					await db.team.update({
						where: {
							stripeCustomerId: subscription.customer.toString(),
						},
						data: {
							plan: "DISABLED",
							stripeSubscriptionId: null,
							maxMonthlyRequests: 0,
							stripeCurrentBillingPeriodStart: null,
							stripeCurrentBillingPeriodEnd: null,
						},
					});
				}

				break;
			}
			default:
				event;
				console.error(
					"Incoming stripe event, that should not be received",
					event.type,
				);
				break;
		}
		res.send("OK");
		return res.end();
	} catch (e) {
		const err = e as Error;
		console.error(err.message);
		res.status(500).send(err.message);
		return res.end();
	}
}
