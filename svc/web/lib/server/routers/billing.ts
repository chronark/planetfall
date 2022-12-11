import { newId } from "@planetfall/id";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { t } from "../trpc";
import { db } from "@planetfall/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2022-11-15",
	typescript: true,
});

export const billingRouter = t.router({
	checkout: t.procedure
		.input(
			z.object({
				teamId: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			if (!ctx.session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const team = await db.team.findUnique({
				where: { id: input.teamId },
				include: {
					members: {
						where: {
							userId: ctx.session.user.id,
						},
					},
				},
			});

			if (!team) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}
			console.log({ input });

			const checkoutSession = await stripe.checkout.sessions.create({
				customer: team.stripeCustomerId,
				payment_method_types: ["card"],
				mode: "subscription",
				line_items: [
					{
						price: process.env.STRIPE_PRICE_ID_PRO!,
					},
				],
				success_url: ctx.req.headers.referer ?? "https://planetfall.io/home",
				cancel_url: ctx.req.headers.referer ?? "https://planetfall.io/home",
			});

			return { url: checkoutSession.url };
		}),
	portal: t.procedure
		.input(
			z.object({
				teamId: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			if (!ctx.session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const team = await db.team.findUnique({
				where: { id: input.teamId },
				include: {
					members: {
						where: {
							userId: ctx.session.user.id,
						},
					},
				},
			});

			if (!team) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const portal = await stripe.billingPortal.sessions.create({
				customer: team.stripeCustomerId,
				return_url: ctx.req.headers.referer ?? "https://planetfall.io/home",
			});

			return { url: portal.url };
		}),


});
