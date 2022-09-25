import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { PrismaClient } from "@planetfall/db";
import { newId } from "@planetfall/id";
import { randomUUID } from "crypto";

const validation = z.object({
  headers: z.object({}),
  body: z.object({
    data: z.object({
      id: z.string(),
      username: z.string(),
    }),
    object: z.string().refine((v) => v === "event"),
    type: z.string().refine((v) => v === "user.created"),
  }),
});

const db = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log(JSON.stringify({
    headers: req.headers,
    body: req.body,
  }));
  try {
    const input = validation.parse(req);

    const teamId = newId("team");
    const user = await db.user.create({
      data: {
        id: newId("user"),
        clerkId: input.body.data.id,
        teams: {
          create: {
            team: {
              create: {
                id: teamId,
                name: input.body.data.username,
                stripeCustomerId: `todo:${randomUUID()}`,
                stripeCurrentBillingPeriodStart: 0,
                retention: 24 * 60 * 60 * 1000
              },
            },
            role: "PERSONAL",
          },
        },
      },
    });
    console.log("Created user:", JSON.stringify(user, null, 2));

    return res.status(200).end();
  } catch (err) {
    console.error(err);
    if (err instanceof z.ZodError) {
      return res.status(400).send(err.message);
    }
    return res.status(500).send((err as Error).message);
  }
}
