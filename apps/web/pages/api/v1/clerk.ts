import { db } from "@planetfall/db";
import { newId } from "@planetfall/id";
import { NextApiRequest, NextApiResponse } from "next";
import { DEFAULT_QUOTA } from "plans";
import slugify from "slugify";
import { z } from "zod";

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
  type: z.enum(["user.created", "user.updated"]),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const v = validation.safeParse(req.body);
    if (!v.success) {
      console.error(JSON.stringify(v.error, null, 2));
      res.status(400).json({ error: v.error });
      return;
    }

    console.log(JSON.stringify(v.data, null, 2));

    const user = await db.user.upsert({
      where: {
        email: v.data.data.email_addresses[0].email_address,
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

    if (v.data.type === "user.created") {
      const slug = slugify(v.data.data.username!, { lower: true, strict: true });

      await db.team.create({
        data: {
          id: newId("team"),
          name: user.name,
          slug: slug,
          members: {
            create: {
              role: "OWNER",
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          },
          maxEndpoints: DEFAULT_QUOTA.FREE.maxEndpoints,
          maxMonthlyRequests: DEFAULT_QUOTA.FREE.maxMonthlyRequests,
          maxTimeout: DEFAULT_QUOTA.FREE.maxTimeout,
          plan: "FREE",
        },
      });
    }

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
