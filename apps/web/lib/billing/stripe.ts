import Stripe from "stripe";
import type { Team } from "@planetfall/db";
import { Client as Tinybird, getUsage } from "@planetfall/tinybird";
import { env } from "../env";

type Req = {
  team: Team;
  year: number;
  month: number;
};

export async function createInvoice({ team, year, month }: Req): Promise<void> {
  if (!team.stripeCustomerId) {
    throw new Error("Team has no stripe customer id");
  }
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15", typescript: true });

  const start = new Date(year, month, 1, 0, 0, 0, 0);
  const end = new Date(year, month + 1, 1, 0, 0, 0, 0);

  const usage = await getUsage({
    teamId: team.id,
    year,
    month,
  });
  const billableUsage = usage.data.reduce((total, day) => total + day.usage, 0);

  if (billableUsage > 0) {
    const invoice = await stripe.invoices.create({
      customer: team.stripeCustomerId,
      auto_advance: false,
      metadata: {
        teamId: team.id,
        plan: team.plan,
      },
    });
    const invoiceItem = await stripe.invoiceItems.create({
      customer: team.stripeCustomerId,
      invoice: invoice.id,
      quantity: billableUsage,
      price: env.STRIPE_PRICE_ID_CHECKS,
      period: {
        start: Math.floor(start.getTime() / 1000),
        end: Math.floor(end.getTime() / 1000),
      },
      description: `Usage for ${team.name} (${team.plan})`,
    });
    console.log("created invoice item", {
      id: invoiceItem.id,
      amount: invoiceItem.amount,
      quantity: invoiceItem.quantity,
    });
  }
}
