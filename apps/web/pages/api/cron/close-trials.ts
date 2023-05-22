import highstorm from "@highstorm/client";
import { db } from "@planetfall/db";
import { Email } from "@planetfall/emails";
import { NextApiRequest, NextApiResponse } from "next";

const key = "aed0b3469e6a7185c0ef0bd1647ee58e760143adba5858e916baf1ead4c0adb9";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.key !== key) {
    res.status(404).end();
    return;
  }
  const teams =await db.team.findMany({
    where: {
      plan: "PRO",
      stripeCustomerId: null,
      trialExpires: {
        lt: new Date(),
      },
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });
  for (const team of teams) {
    console.log("Team", team.id, "disabling team because trial expired");

   await db.team.update({
      where: { id: team.id },
      data: { plan: "DISABLED" },
    });
    await highstorm("team.plan.change", {
      event: `${team.slug} changed their plan to DISABLED`,
      metadata: {
        actorId: "cron",
        resourceId: team.id,
        source: "cron",
      },
    });
    const email = new Email();
    await Promise.all(
      team.members.map((m) =>
        email.sendEndofTrial({
          to: m.user.email,
          username: m.user.name,
          teamName: team.name,
          teamSlug: team.slug,
        }),
      ),
    );
  }
  console.log("Deactivated", teams.length, "teams");
  res.status(200).end();
}
