import { db } from "@planetfall/db";
import { roles } from "@planetfall/auth";
import { NextApiRequest, NextApiResponse } from "next";
import crypto from "node:crypto";
import { Stripe } from "stripe";
import { z } from "zod";
import { ApiError } from "lib/api/error";
import type { ApiResponse } from "lib/api/response";
import slugify from "slugify";
import { newSessionToken } from "@planetfall/auth";
import { DEFAULT_QUOTA } from "plans";
import { newId } from "@planetfall/id";
import { Webhook } from "svix";
import { buffer } from "micro";

const input = z.object({
  object: z.enum(["event"]),
  type: z.enum(["session.ended", "session.removed", "session.revoked"]),
  data: z.object({
    id: z.string(),
    user_id: z.string(),
    object: z.enum(["session"]),
  }),
});
export type Input = z.infer<typeof input>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret || req.headers.authorization !== webhookSecret) {
      throw new ApiError({
        status: 401,
        message: "Unauthorized",
      });
    }
    const request = input.safeParse(req.body);
    if (!request.success) {
      throw new ApiError({
        status: 400,
        message: request.error.message,
      });
    }

    const { hash } = newSessionToken(
      request.data.data.user_id,
      request.data.data.user_id,
    );

    await db.token.delete({
      where: {
        hash,
      },
    });

    res.status(202).send("OK");
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
