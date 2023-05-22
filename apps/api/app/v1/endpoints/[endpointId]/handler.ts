import { kysely } from "@/lib/kysely";
import { authorize } from "@/lib/auth";
import { makeRequestHandler } from "@/lib/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { assertion } from "@planetfall/assertions";

export const getEndpoint = makeRequestHandler({
  method: "GET",
  path: "/v1/endpoints",
  description: "Retrieve a list of all endpoints for a team",
  input: z.object({
    endpointId: z.string(),
  }),
  output: z.object({
    endpoint: z.object({
      id: z.string(),
      method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
      name: z.string(),
      teamId: z.string(),
      url: z.string(),
      createdAt: z.number().int(),
      updatedAt: z.number().int(),
      followRedirects: z.boolean(),
      prewarm: z.boolean().nullable(),
      runs: z.number().int().nullable(),
      ownerId: z.string().nullable(),
      // auditLog: z.array(z.object({})),// FIXME:
      interval: z.number().int(),
      active: z.boolean(),
      degradedAfter: z.number().int().nullable(),
      timeout: z.number().int(),
      distribution: z.enum(["RANDOM", "ALL"]),
      regions: z.array(z.string()),
      headers: z.record(z.string()).optional(),
      body: z.string().nullable(),
      assertions: z.array(assertion),
      // pages: z.array(z.string()),
      // alerts: z.array(z.object({})),// FIXME:
      // setup: z.object({}).optional(),// FIXME:
    }),
  }),
  run: async ({ request, input, sendOutput }) => {
    const auth = await authorize(request);
    if (auth.error) {
      return auth.res;
    }

    const [endpoint, regions] = await Promise.all([
      kysely
        .selectFrom("Endpoint")
        .selectAll()
        .where("Endpoint.id", "=", input.endpointId)
        .executeTakeFirst(),
      kysely
        .selectFrom("_EndpointToRegion")
        .select("_EndpointToRegion.B")
        .where("_EndpointToRegion.A", "=", input.endpointId)
        .execute(),
    ]);

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
    }
    const access = auth.policy.validate(
      "endpoint:read",
      `${endpoint.teamId}::endpoint::${endpoint.id}`,
    );
    if (!access.valid) {
      return NextResponse.json({ error: "Unauthorized", message: access.error }, { status: 403 });
    }

    return sendOutput({
      endpoint: {
        id: input.endpointId,
        method: endpoint.method as any,
        name: endpoint.name,
        teamId: endpoint.teamId,
        url: endpoint.url,
        createdAt: endpoint.createdAt.getTime(),
        updatedAt: endpoint.updatedAt.getTime(),
        followRedirects: Boolean(endpoint.followRedirects),
        prewarm: Boolean(endpoint.prewarm),
        runs: endpoint.runs,
        ownerId: endpoint.ownerId,
        // auditLog: [],
        interval: endpoint.interval,
        active: Boolean(endpoint.active),
        degradedAfter: endpoint.degradedAfter,
        timeout: endpoint.timeout ?? 0,
        distribution: endpoint.distribution,
        regions: regions.map((r) => r.B),
        // headers: endpoint.headers,
        body: endpoint.body,
        assertions: JSON.parse(endpoint.assertions ?? "[]"),
        // pages: endpoint.pages,
        // alerts: endpoint.alerts,
        // setup: endpoint.setup,
      },
    });
  },
});
