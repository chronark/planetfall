import { db } from "@planetfall/db";
import { NextApiRequest, NextApiResponse } from "next";

const key = "aed0b3469e6a7185c0ef0bd1647ee58e760143adba5858e916baf1ead4c0adb9";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.key !== key) {
    res.status(404).end();
    return;
  }
  const teams = await db.team.findMany({
    where: {
      plan: "PRO",
      stripeCustomerId: null,
      trialExpires: {
        lt: new Date(),
      },
    },
    include: {
      members: true,
    },
  });
  for (const team of teams) {
    console.log("Team", team.id, "disabling team because trial expired");
    // TODO: Send email to team members
    await db.team.update({
      where: { id: team.id },
      data: { plan: "DISABLED" },
    });
  }
  console.log("Deactivated", teams.length, "teams");
  res.status(200).end();
}
