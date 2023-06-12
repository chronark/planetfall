import { env } from "@/lib/env";
import { db } from "@planetfall/db";
import { getUsage } from "@planetfall/tinybird";
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

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
      AND: {
        stripeCustomerId: {
          not: null,
        },
        plan: {
          not: "FREE",
        },
      },
    },
  });
  console.log(`Creating invoices for ${teams.length} teams`);
  for (let team of teams) {
    if (!team.stripeCustomerId) {
      console.error(
        `Team ${team.id} does not have a stripeCustomerId. This should not be possible`,
      );
      continue;
    }
    // Set the stripe price id for this team
    if (!team.stripePriceId) {
      team = await db.team.update({
        where: {
          id: team.id,
        },
        data: {
          stripePriceId: env.STRIPE_PRICE_ID_CHECKS,
        },
      });
    }

    console.log("creating invoice", { teamId: team.id });

    const usage = await getUsage({
      teamId: team.id,
      year: start.getUTCFullYear(),
      month: start.getUTCMonth() + 1,
    });
    console.log(
      JSON.stringify({
        teamId: team.id,
        usage: usage.data,
      }),
    );
    const totalUsage = usage.data.reduce((total, day) => total + day.usage, 0);

    if (totalUsage > 100000) {
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
        price: team.stripePriceId ?? env.STRIPE_PRICE_ID_CHECKS,
        period: {
          start: Math.floor(start.getTime() / 1000),
          end: Math.floor(end.getTime() / 1000),
        },
        description: `Usage for ${team.name} (${team.plan})`,
      });
      console.log("created invoice item", { id: invoiceItem.id });
    }
  }

  res.status(200).end();
}
