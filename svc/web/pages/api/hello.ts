// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@planetfall/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const db = new PrismaClient();

  const users = await db.user.findMany();
  res.status(200).json({ name: "John Doe", users });
}
