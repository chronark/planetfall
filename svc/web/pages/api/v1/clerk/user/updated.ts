import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { PrismaClient } from "@planetfall/db";
import { newId } from "@planetfall/id";

const validation = z.object({
  headers: z.object({}),
  body: z.object({
    data: z.object({
      id: z.string(),
      username: z.string(),
    }),
    object: z.string().refine((v) => v === "event"),
    type: z.string().refine((v) => v === "user.updated"),
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

    const user = await db.user.findUniqueOrThrow({
      where: {
        clerkId: input.body.data.id,
      },
      include: {
        teams: {
          where: {
            role: "PERSONAL",
          },
          include: {
            team: true,
          }
        }
      }
    });
    if (user.teams.length !== 1) {
      throw new Error("Expected exactly one personal team");
    }
    if (user.teams[0].team.name !== input.body.data.username) {
      await db.team.update({
        where: {
          id: user.teams[0].team.id,
        },
        data: {
          name: input.body.data.username,
        },
      });
    }

  
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
