import { db } from "@planetfall/db";
import { NextApiRequest, NextApiResponse } from "next";
import { Stripe } from "stripe";
import { z } from "zod";
import { ApiError } from "lib/api/error";
import slugify from "slugify";
import { DEFAULT_QUOTA } from "plans";
import { newId } from "@planetfall/id";

const input = z.object({
  method: z.enum(["POST"]),
  body: z.object({
    object: z.enum(["event"]),
    type: z.enum(["user.created"]),
    data: z.object({
      id: z.string(),
      object: z.enum(["user"]),
      username: z.string(),
      email_addresses: z
        .array(
          z.object({
            email_address: z.string(),
          }),
        )
        .optional(),
    }),
  }),
});
export type Input = z.infer<typeof input>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    const request = input.safeParse(req);
    if (!request.success) {
      throw new ApiError({
        status: 400,
        message: request.error.message,
      });
    }

    const slug = slugify(request.data.body.data.username);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2022-08-01",
      typescript: true,
    });
    const customer = await stripe.customers.create({
      email: request.data.body.data.email_addresses &&
          request.data.body.data.email_addresses.length > 0
        ? request.data.body.data.email_addresses[0].email_address
        : undefined,
    });

    await db.team.create({
      data: {
        id: newId("team"),
        isPersonal: true,
        name: request.data.body.data.username,
        slug,
        plan: "FREE",
        stripeCustomerId: customer.id,
        retention: DEFAULT_QUOTA.FREE.retention,
        maxMonthlyRequests: DEFAULT_QUOTA.FREE.maxMonthlyRequests,
        maxEndpoints: DEFAULT_QUOTA.FREE.maxEndpoints,
        minInterval: DEFAULT_QUOTA.FREE.minInterval,
        maxTimeout: DEFAULT_QUOTA.FREE.maxTimeout,
        members: {
          create: {
            userId: request.data.body.data.id,
            role: "OWNER",
          },
        },
      },
    });

    res.status(200).send("OK");
  } catch (e) {
    if (e instanceof ApiError) {
      console.error(e.message);
      res.status(e.status).json({
        error: { code: e.status.toString(), message: e.message },
      });
      return;
    }
    res.status(500).json({
      error: { code: "unexpected", message: (e as Error).message },
    });
  }
}
