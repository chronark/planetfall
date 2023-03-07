import { db } from "@planetfall/db";
import { NextApiRequest, NextApiResponse } from "next";

const key = "13cf53eab0949cf835f5018a2b69ea754c4e99f715fb1d7b4c91ee3bd852b94f";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.key !== key) {
    res.status(404).end();
    return;
  }
  const deleted = await db.check.deleteMany({
    where: {
      time: {
        lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days
      },
    },
  });
  console.log("Deleted", deleted.count, "checks");
  res.status(200).end();
}
