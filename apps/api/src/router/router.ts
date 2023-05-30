import { authorize } from "../auth";
import { Bindings } from "../bindings";
import { AuthorizationError, NotFoundError } from "../errors";
import { kysely } from "../kysely";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cache } from "hono/cache";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { z } from "zod";

import { Tinybird } from "@chronark/zod-bird";

export const app = new Hono<{ Bindings: Bindings }>();

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
  cache({
    cacheName: "regions",
    cacheControl: "public, max-age=3600",
    wait: true,
  }),
  async (c) => {
    const { platform } = c.req.valid("query");
    let q = kysely(c.env.DATABASE_URL)
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
    const regions = await q.execute();

    return Response.json(regions, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    });
  },
);

app.get("/v1/endpoints", async (c) => {
  const auth = await authorize(c);

  const endpoints = await kysely(c.env.DATABASE_URL)
    .selectFrom("Endpoint")
    .where("teamId", "=", auth.team.id)
    .selectAll()
    .execute();

  if (endpoints.length === 0) {
    return Response.json([], {
      status: 200,
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
      const regions = await kysely(c.env.DATABASE_URL)
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

  return Response.json(endpointsWithRegions);
});

app.get("/v1/endpoints/:endpointId", async (c) => {
  const endpointId = c.req.param("endpointId");

  const auth = await authorize(c);
  const access = auth.policy.validate("endpoint:read", `${auth.team.id}::endpoint::${endpointId}`);
  if (!access.valid) {
    throw new AuthorizationError(access.error);
  }

  const endpoint = await kysely(c.env.DATABASE_URL)
    .selectFrom("Endpoint")
    .where("Endpoint.id", "=", endpointId)
    .selectAll()
    .executeTakeFirst();

  if (!endpoint) {
    throw new NotFoundError("Endpoint not found");
  }

  const regions = await kysely(c.env.DATABASE_URL)
    .selectFrom("_EndpointToRegion")
    .select("A")
    .select("B")
    .where("A", "=", endpoint.id)
    .execute();
  return Response.json(
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
    },
  );
});

app.get(
  "/v1/endpoints/:endpointId/checks/latest/:interval",
  zValidator("param", z.object({ endpointId: z.string(), interval: z.enum(["10m"]) })),
  cache({
    cacheName: "checks",
    cacheControl: "public, max-age=10",
  }),
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

    const tb = new Tinybird({ token: c.env.TINYBIRD_TOKEN });

    const get10Minutes = tb.buildPipe({
      pipe: "api__get_latest_10m",
      parameters: z.object({
        endpointId: z.string(),
      }),
      data: z.object({
        time: z.string().transform((s) => new Date(s).getTime()),
        latency: z.number().nullable(),
        regionId: z.string(),
        status: z.number().nullable(),
        error: z.string().nullable(),
      }),
    });

    const checks = await get10Minutes({ endpointId });

    return Response.json(
      checks.data.map((check) => ({
        time: check.time,
        latency: check.latency ?? undefined,
        regionId: check.regionId,
        status: check.status ?? undefined,
        error: check.error ?? undefined,
      })),
    );
  },
);
