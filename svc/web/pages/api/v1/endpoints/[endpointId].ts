import { db, PrismaClient } from "@planetfall/db";
import { NextApiRequest, NextApiResponse } from "next";
import crypto from "node:crypto";
import { object, z } from "zod";
import { ApiError } from "lib/api/error";
import { getAuth } from "@clerk/nextjs/server";

import type { ApiResponse } from "lib/api/response";
import { withMiddleware, withRecoverer } from "lib/api/middleware";
import { newId } from "@planetfall/id";

const input = z.object({
  method: z.enum(["DELETE"]),
  query: z.object({
    endpointId: z.string(),
  }),
});
export type Input = z.infer<typeof input>;
export type Output = ApiResponse<{}>;

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Output>,
): Promise<void> {
  const auth = getAuth(req);

  if (!auth.sessionId) {
    throw new ApiError({ status: 403, message: "Missing auth" });
  }

  const request = input.safeParse(req);
  if (!request.success) {
    throw new ApiError({
      status: 400,
      message: JSON.stringify(JSON.parse(request.error.message)),
    });
  }
  console.log(request);

  const endpoint = await db.endpoint.findUnique({
    where: { id: request.data.query.endpointId },
    include: {
      team: {
        include: { members: true },
      },
    },
  });

  if (!endpoint) {
    throw new ApiError({ status: 404, message: "endpoint not found" });
  }
  if (!endpoint.team.members.some((m) => m.userId === auth.userId)) {
    throw new ApiError({ status: 403, message: "unauthorized" });
  }
  await db.endpoint.delete({ where: { id: request.data.query.endpointId } });

  res.json({ data: {} });
}

export default withMiddleware(handler, withRecoverer());
