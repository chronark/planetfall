import { Check, PrismaClient } from "@planetfall/db";
import { Permission } from "@planetfall/permissions";
import CheckableTag from "antd/lib/tag/CheckableTag";
import { NextApiRequest, NextApiResponse } from "next";
import crypto from "node:crypto";
import { z } from "zod";

class ApiError extends Error {
  public readonly status: number;
  constructor(opts: { status: number; message: string }) {
    super(opts.message);
    this.status = opts.status;
  }
}

const input = z.object({
  method: z.enum(["GET"]),
  query: z.object({
    endpointId: z.string(),
    since: z.string()
      .transform((since, ctx) => {
        const n = parseInt(since);
        if (Number.isNaN(n)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "not an integer",
          });
        }
        return n;
      })
      .optional(),
    region: z.string().optional(),
    limit: z.string()
      .transform((limit, ctx) => {
        const n = parseInt(limit);
        if (Number.isNaN(n)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "not an integer",
          });
        }
        if (n <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "must be positive",
          });
        }
        return n;
      })
      .optional(),
  }),
});

type Res =
  | {
    data: {
      id: string;
      endpointId: string;
      latency?: number;
      time: number;

      error?: string;
      status?: number;
      body?: string;

      headers?: Record<string, string>;
      regionId: string;
    }[];
    error?: never;
  }
  | {
    data?: never;
    error: {
      code: string;
      message: string;
    };
  };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Res>,
): Promise<void> {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) {
      throw new ApiError({
        status: 401,
        message: "authorization header is missing",
      });
    }

    const request = input.safeParse(req);
    if (!request.success) {
      throw new ApiError({
        status: 400,
        message: JSON.stringify(JSON.parse(request.error.message)),
      });
    }
    const bearerToken = authorization.replace("Bearer ", "");

    const hash = crypto.createHash("sha256").update(bearerToken).digest(
      "base64",
    );
    const db = new PrismaClient();
    const token = await db.token.findUnique({ where: { tokenHash: hash } });

    if (!token) {
      throw new ApiError({ status: 401, message: "invalid token" });
    }
    const permissions = Permission.from(token.permissions);

    if (!permissions.verify({ resource: "checks", action: "read" })) {
      throw new ApiError({
        status: 401,
        message: "not allowed to perform this action",
      });
    }

    const endpoint = await db.endpoint.findUnique({
      where: {
        id: request.data.query.endpointId,
      },
      include: {
        team: {
          include: { members: true },
        },
      },
    });
    if (!endpoint) {
      throw new ApiError({ status: 404, message: "endpoint not found" });
    }

    const user = endpoint.team.members.find((m) => m.userId === token.userId);
    if (!user) {
      throw new ApiError({
        status: 401,
        message: "user does not belong to team",
      });
    }

    const checks = await db.check.findMany({
      where: {
        endpointId: request.data.query.endpointId,
        regionId: request.data.query.region,
        time: {
          gte: request.data.query.since
            ? new Date(request.data.query.since)
            : undefined,
        },
      },
      orderBy: {
        time: "desc",
      },
      take: request.data.query.limit || 1000,
    });

    res.json({
      data: checks.map((c) => ({
        ...c,
        headers: c.headers !== null
          ? c.headers as Record<string, string>
          : undefined,
        body: c.body ?? undefined,
        time: c.time.getTime(),
        latency: c.latency !== null ? c.latency : undefined,
        error: c.error ?? undefined,
        status: c.status ?? undefined,
      })),
    });
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
