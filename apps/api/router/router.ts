import { authorize } from "@/lib/auth";
import { AuthorizationError, NotFoundError } from "@/lib/errors";
import { kysely } from "@/lib/kysely";
import { zValidator } from "@hono/zod-validator";
import { getLatestChecks10Minutes } from "@planetfall/tinybird";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { NextResponse } from "next/server";
import { z } from "zod";

import { Redis } from "@upstash/redis"

type Check = {
  time: number
  latency?: number
  regionId: string
  status?: number
  error?: string
}


const redis = Redis.fromEnv()

export const app = new Hono();

app.onError((err, c) => {
  console.error(err.message);
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  return c.json({ error: "Internal Server Error" }, { status: 500 });
});
app.use("*", logger());
app.use("*", async (_c, next) => {
  const now = Date.now();
  await next();
  const responseTime = Date.now() - now;
  console.log(`Request took ${responseTime}ms`);
});

app.get("/v1/liveness", (c) => c.text("ok"));
app.get(
  "/v1/regions/:platform?",
  zValidator("query", z.object({ platform: z.enum(["aws", "vercelEdge", "fly"]).optional() })),
  async (c) => {
    const { platform } = c.req.valid("query");
    let q = kysely
      .selectFrom("Region")
      .select("Region.id")
      .select("Region.platform")
      .select("Region.region")
      .select("Region.lat")
      .select("Region.lon")
      .where("Region.visible", "=", 1);

    if (platform) {
      q = q.where("Region.platform", "=", platform);
    }
    console.log("platform", platform);
    const regions = await q.execute();

    return new Response(JSON.stringify(regions), {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "application/json",
      },
    });
  },
);

app.get("/v1/endpoints", async (c) => {
  const auth = await authorize(c);

  const endpoints = await kysely
    .selectFrom("Endpoint")
    .where("teamId", "=", auth.team.id)
    .selectAll()
    .execute();

  if (endpoints.length === 0) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
    });
  }

  const endpointsWithAccess = endpoints.filter((endpoint) => {
    const access = auth.policy.validate(
      "endpoint:read",
      `${auth.team.id}::endpoint::${endpoint.id}`,
    );
    if (!access.valid) {
      console.warn(
        `User ${auth.team.id} tried to access endpoint ${endpoint.id} but was denied: ${access.error}`,
      );
      return false;
    }
    return true;
  });

  const endpointsWithRegions = await Promise.all(
    endpointsWithAccess.map(async (endpoint) => {
      const regions = await kysely
        .selectFrom("_EndpointToRegion")
        .select("A")
        .select("B")
        .where("A", "=", endpoint.id)
        .execute();

      return {
        id: endpoint.id,
        method: endpoint.method,
        name: endpoint.name,
        teamId: endpoint.teamId,
        url: endpoint.url,
        createdAt: endpoint.createdAt,
        updatedAt: endpoint.updatedAt,
        followRedirects: Boolean(endpoint.followRedirects),
        prewarm: Boolean(endpoint.prewarm),
        runs: endpoint.runs ?? 1,
        interval: endpoint.interval,
        active: Boolean(endpoint.active),
        degradedAfter: endpoint.degradedAfter,
        timeout: endpoint.timeout,
        distribution: endpoint.distribution,
        regions: regions.map((r) => ({
          id: r.B,
        })),
        headers: endpoint.headers,
        body: endpoint.body,
        assertions: endpoint.assertions,
      };
    }),
  );

  return NextResponse.json(endpointsWithRegions, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Content-Type": "application/json",
    },

  });
});

app.get("/v1/endpoints/:endpointId", async (c) => {
  const endpointId = c.req.param("endpointId");

  const auth = await authorize(c);
  const access = auth.policy.validate("endpoint:read", `${auth.team.id}::endpoint::${endpointId}`);
  if (!access.valid) {
    throw new AuthorizationError(access.error);
  }

  const endpoint = await kysely
    .selectFrom("Endpoint")
    .where("Endpoint.id", "=", endpointId)
    .selectAll()
    .executeTakeFirst();

  if (!endpoint) {
    throw new NotFoundError("Endpoint not found");
  }

  const regions = await kysely
    .selectFrom("_EndpointToRegion")
    .select("A")
    .select("B")
    .where("A", "=", endpoint.id)
    .execute();
  return NextResponse.json(
    {
      id: endpoint.id,
      method: endpoint.method,
      name: endpoint.name,
      teamId: endpoint.teamId,
      url: endpoint.url,
      createdAt: endpoint.createdAt,
      updatedAt: endpoint.updatedAt,
      followRedirects: Boolean(endpoint.followRedirects),
      prewarm: Boolean(endpoint.prewarm),
      runs: endpoint.runs ?? 1,
      interval: endpoint.interval,
      active: Boolean(endpoint.active),
      degradedAfter: endpoint.degradedAfter,
      timeout: endpoint.timeout,
      distribution: endpoint.distribution,
      regions: regions.map((r) => ({
        id: r.B,
      })),
      headers: endpoint.headers,
      body: endpoint.body,
      assertions: endpoint.assertions,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=300",
        "Content-Type": "application/json",
      },


    },
  );
});

app.get(
  "/v1/endpoints/:endpointId/checks/latest/:interval",
  zValidator("param", z.object({ endpointId: z.string(), interval: z.enum(["10m"]) })),
  async (c) => {
    const endpointId = c.req.param("endpointId");

    const auth = await authorize(c);
    const access = auth.policy.validate(
      "endpoint:read",
      `${auth.team.id}::endpoint::${endpointId}`,
    );
    if (!access.valid) {
      throw new AuthorizationError(access.error);
    }
    const cacheKey = c.req.path

    let checks = await redis.get<Check[]>(cacheKey)
    if (!checks) {
      checks = await getLatestChecks10Minutes({ endpointId }).then((res) => res.data.map((check) => ({
        time: check.time,
        latency: check.latency ?? undefined,
        regionId: check.regionId,
        status: check.status ?? undefined,
        error: check.error ?? undefined,
      })))

      await redis.set(cacheKey, checks, { ex: 60 })
    }

    return NextResponse.json(
      checks ?? [],
      {
        headers: {
          "Cache-Control": "public, max-age=60",
          "Content-Type": "application/json",
        },

      }
    );
  },
);
