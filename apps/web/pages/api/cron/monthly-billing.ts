import { env } from "@/lib/env";
import { db } from "@planetfall/db";
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { Client as Tinybird, getUsage } from "@planetfall/tinybird";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

const _tinybird = new Tinybird();

const key = "480a32723978b74dae12dd2508033952861256ae63698e18a3f031eabdc45e38";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.key !== key) {
    res.status(404).end();
    return;
  }
  // Times of the past month
  const now = new Date();
  const start = new Date(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0, 0);
  const end = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0);

  const teams = await db.team.findMany({
    where: {
      stripeCustomerId: {
        not: null,
      },
    },
  });
  for (const team of teams) {
    console.log("creating invoice", { teamId: team.id });

    const usage = await getUsage({
      teamId: team.id,
      year: now.getUTCFullYear(),
      month: now.getUTCMonth() + 1,
    });
    const totalUsage = usage.data.reduce((total, day) => total + day.usage, 0);

    if (totalUsage > 0) {
      const invoice = await stripe.invoices.create({
        customer: team.stripeCustomerId!,
        auto_advance: false,

        metadata: {
          teamId: team.id,
          plan: team.plan,
          period: `${start.getDate()} - ${end.getDate()}`,
        },
      });
      const invoiceItem = await stripe.invoiceItems.create({
        customer: team.stripeCustomerId!,
        invoice: invoice.id,
        quantity: totalUsage,
        price: env.STRIPE_PRICE_ID_CHECKS,
        period: {
          start: Math.floor(start.getTime() / 1000),
          end: Math.floor(end.getTime() / 1000),
        },
        description: `Usage for ${team.name}(${team.plan})`,
      });
      console.log("created invoice item", { id: invoiceItem.id });
    }
  }

  res.status(200).end();
}
