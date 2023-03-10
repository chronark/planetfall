import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  res.json({
    userId,
  });
  return res.end();
}
