import { db } from "@planetfall/db";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { env } from "@/lib/env";

const validation = z.object({
  data: z.object({
    email_addresses: z
      .array(
        z.object({
          email_address: z.string().email(),
        }),
      )
      .min(1),
    external_id: z.string().nullable(),

    id: z.string(),
    object: z.literal("user"),
    profile_image_url: z.string().url().nullable(),
    username: z.string().nullable(),
    updated_at: z.number(),
  }),
  object: z.literal("event"),
  type: z.enum(["user.updated"]),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.headers.authorization !== env.CLERK_WEBHOOK_SECRET) {
      return res.status(401).send("unauthorized");
    }
    const v = validation.safeParse(req.body);
    if (!v.success) {
      console.error(JSON.stringify(v.error, null, 2));
      res.status(400).json({ error: v.error });
      return;
    }


    await db.user.upsert({
      where: {
        id: v.data.data.id,
      },
      update: {
        id: v.data.data.id,
        email: v.data.data.email_addresses[0].email_address,
        name: v.data.data.username ?? undefined,
        image: v.data.data.profile_image_url,
      },
      create: {
        id: v.data.data.id,
        email: v.data.data.email_addresses[0].email_address,
        name: v.data.data.username!,
        image: v.data.data.profile_image_url,
      },
    });

    return res.status(200).send("ok");
  } catch (e) {
    if (e instanceof Error) {
      console.error(e);
      res.status(500).json({ error: e.message });
    } else {
      throw e;
    }
  } finally {
    res.end();
  }
}
