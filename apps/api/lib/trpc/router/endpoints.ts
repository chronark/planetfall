import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { assertion } from "@planetfall/assertions";
import { db } from "@planetfall/db";
import { auth, t } from "../trpc";
import { getLatestChecks10Minutes } from "@planetfall/tinybird";

export const endpointsRouter = t.router({
  listEndpoints: t.procedure
    .use(auth)
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/endpoints",
        tags: ["endpoints"],
        summary: "Read all endpoints",
      },
    })
    .input(z.void())
    .output(
      z.array(
        z.object({
          id: z.string().describe("The id of the endpoint"),
          method: z
            .enum(["GET", "POST", "PUT", "PATCH", "DELETE"])
            .describe("The HTTP method of the endpoint"),
          name: z.string().describe("The name of the endpoint"),
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
          timeout: z.number().int().nullable(),
          distribution: z.enum(["RANDOM", "ALL"]),
          regions: z.array(z.string()),
          headers: z.record(z.string()).nullable(),
          body: z.string().nullable(),
          assertions: z.array(assertion),

          // pages: z.array(z.string()),
          // alerts: z.array(z.object({})),// FIXME:
          // setup: z.object({}).optional(),// FIXME:
        }),
      ),
    )
    .query(async ({ ctx }) => {
      const endpoints = await db.endpoint.findMany({
        where: {
          teamId: ctx.auth.team.id,
        },
        include: {
          regions: true,
        },
      });
      const endpointsWithAccess = endpoints.filter((endpoint) => {
        const access = ctx.auth.policy.validate(
          "endpoint:read",
          `${endpoint.teamId}::endpoint::${endpoint.id}`,
        );
        if (!access.valid) {
          console.warn(
            `Team ${ctx.auth.team.id} tried to access endpoint ${endpoint.id} but was denied access: ${access.error}`,
          );
          return false;
        }
        return true;
      });

      return endpointsWithAccess.map((e) => ({
        ...e,
        assertions: JSON.parse(e.assertions ?? "[]") as any,
        headers: e.headers as any,
        createdAt: e.createdAt.getTime(),
        updatedAt: e.updatedAt.getTime(),
        method: e.method as any,
        regions: e.regions.map((r) => r.id),
      }));
    }),
  getEndpointById: t.procedure
    .use(auth)
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/endpoints/{endpointId}",
        tags: ["endpoints"],
        summary: "Get an endpoint by id",
      },
    })
    .input(z.object({ endpointId: z.string() }))
    .output(
      z.object({
        id: z.string().describe("The id of the endpoint"),
        method: z
          .enum(["GET", "POST", "PUT", "PATCH", "DELETE"])
          .describe("The HTTP method of the endpoint"),
        name: z.string().describe("The name of the endpoint"),
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
        timeout: z.number().int().nullable(),
        distribution: z.enum(["RANDOM", "ALL"]),
        regions: z.array(z.string()),
        headers: z.record(z.string()).nullable(),
        body: z.string().nullable(),
        assertions: z.array(assertion),

        // pages: z.array(z.string()),
        // alerts: z.array(z.object({})),// FIXME:
        // setup: z.object({}).optional(),// FIXME:
      }),
    )
    .query(async ({ ctx, input }) => {
      const access = ctx.auth.policy.validate(
        "endpoint:read",
        `${ctx.auth.team.id}::endpoint::${input.endpointId}`,
      );

      if (!access.valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: access.error,
        });
      }

      const endpoint = await db.endpoint.findUnique({
        where: {
          id: input.endpointId,
        },
        include: {
          regions: true,
        },
      });
      if (!endpoint) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Endpoint ${input.endpointId} not found`,
        });
      }

      return {
        ...endpoint,
        assertions: JSON.parse(endpoint.assertions ?? "[]") as any,
        headers: endpoint.headers as any,
        createdAt: endpoint.createdAt.getTime(),
        updatedAt: endpoint.updatedAt.getTime(),
        method: endpoint.method as any,
        regions: endpoint.regions.map((r) => r.id),
      };
    }),
  getLatest: t.procedure
    .use(auth)
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/endpoints/{endpointId}/checks/latest",
        tags: ["endpoints"],
        summary: "Get latest check for endpoint",
      },
    })
    .input(
      z.object({
        endpointId: z.string().describe("The id of the endpoint"),
        since: z.enum(["10m"]).describe("The time since the last check"),
      }),
    )
    .output(
      z.array(
        z.object({
          latency: z
            .number()
            .nullable()
            .describe("The latency of the check, in ms. Can be null if the check failed"),
          status: z
            .number()
            .nullable()
            .describe("The HTTP status code of the check. Can be null if the check failed"),
          regionId: z
            .string()
            .describe("The internal planetfall id of the region the check was performed in"),
          time: z.number().int().describe("The time the check was performed, Unix timestamp in ms"),
          error: z
            .string()
            .nullable()
            .describe("The error message of the check. Will be null if the check succeeded"),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
      const access = ctx.auth.policy.validate(
        "endpoint:checks:read",
        `${ctx.auth.team.id}::endpoint::${input.endpointId}`,
      );
      if (!access.valid) {
        console.warn(
          `Team ${ctx.auth.team.id} tried to access endpoint ${input.endpointId} but was denied access: ${access.error}`,
        );
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: access.error,
        });
      }

      const res = await getLatestChecks10Minutes({ endpointId: input.endpointId });
      return res.data;
    }),
});
