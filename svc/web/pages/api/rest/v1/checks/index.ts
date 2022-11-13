import { db, PrismaClient } from "@planetfall/db";
import { getRole } from "lib/api";
import { NextApiRequest, NextApiResponse } from "next";
import crypto from "node:crypto";
import { z } from "zod";
import { ApiError } from "lib/api/error";
import type { ApiResponse } from "lib/api/response";
import { newId } from "@planetfall/id";
import { Client as Tinybird } from "@planetfall/tinybird";
import { auth } from "@clerk/nextjs/app-beta";

const input = z.object({
  method: z.enum(["POST"]),
  headers: z.object({
    "content-type": z.enum(["application/json"]),
  }),
  body: z.object({
    method: z.enum(["GET", "POST", "PUT", "DELETE"]),
    url: z.string().url(),
    regionIds: z.array(z.string()).min(1).max(5),
    repeat: z.boolean().optional(),
  }),
});
export type Input = z.infer<typeof input>;
export type Output = ApiResponse<
  {
    region: {
      id: string;
      name: string;
    };
    checks: {
      id: string;
      latency?: number;
      time: number;

      status: number;
      body: string;

      headers: Record<string, string>;
      timing: {
        dnsStart: number;
        dnsDone: number;
        connectStart: number;
        connectDone: number;
        firstByteStart: number;
        firstByteDone: number;
        tlsHandshakeStart: number;
        tlsHandshakeDone: number;
        transferStart: number;
        transferDone: number;
      };
    }[];
  }[]
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Output>,
): Promise<void> {
  try {
    const role = await getRole(req);
    const auth = role.authorize({ check: ["trigger"] });
    if (!auth.success) {
      throw new ApiError({ status: 403, message: "Forbidden" });
    }

    const request = input.safeParse(req);
    if (!request.success) {
      throw new ApiError({
        status: 400,
        message: JSON.stringify(JSON.parse(request.error.message)),
      });
    }
    const regions = await Promise.all(
      request.data.body.regionIds.map(async (regionId) => {
        const region = await db.region.findUnique({
          where: { id: regionId },
        });
        if (!region) {
          throw new ApiError({
            status: 400,
            message: `regionId: ${regionId} not found`,
          });
        }

        const res = await fetch(region.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: request.data.body.url,
            method: request.data.method,
            timeout: 2000,
            checks: request.data.body.repeat ? 2 : 1,
          }),
        });
        if (res.status !== 200) {
          throw new ApiError({
            status: 500,
            message: `unable to ping: ${region.id} [${res.status}]: ${await res
              .text()}`,
          });
        }

        const checks = (await res.json()) as {
          time: number;
          status: number;
          latency: number;
          body: string;
          headers: Record<string, string>;
          timing: {
            dnsStart: number;
            dnsDone: number;
            connectStart: number;
            connectDone: number;
            firstByteStart: number;
            firstByteDone: number;
            tlsHandshakeStart: number;
            tlsHandshakeDone: number;
            transferStart: number;
            transferDone: number;
          };
        }[];

        return {
          region: {
            id: region.id,
            name: region.name,
          },
          checks: checks.map((c) => ({
            ...c,
            id: newId("check"),
          })),
        };
      }),
    );

    res.json({ data: regions });
    return;
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
