import { kysely } from "@/lib/kysely";
import { authorize } from "@/lib/auth";
import { makeRequestHandler } from "@/lib/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { assertion } from "@planetfall/assertions"

export const getEndpoints = makeRequestHandler({
  method: "GET",
  path: "/v1/endpoint/:endpointId",
  description: "Retrieve a single endpoint by its id",
  input: z.object({}),
  output: z.object({
    endpoints: z.array(z.object({
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
    }))
  }),
  run: async ({ request, input, sendOutput }) => {
    const auth = await authorize(request)
    if (auth.error) {
      return auth.res
    }




    const endpoints = await kysely.selectFrom("Endpoint").selectAll().where("Endpoint.teamId", "=", auth.teamId).execute()

    const endpointsWithAccess = endpoints.filter(endpoint => {
      const access = auth.policy.validate("endpoint:read", `${endpoint.teamId}::endpoint::${endpoint.id}`)
      if (!access.valid) {
        console.warn(`Team ${auth.teamId} tried to access endpoint ${endpoint.id} but was denied access: ${access.error}`)
        return false
      }
      return true
    })


    const endpointsWithRegions = await Promise.all(endpointsWithAccess.map(async (endpoint) => {
      const regions = await kysely.selectFrom("_EndpointToRegion").select("_EndpointToRegion.B").where("_EndpointToRegion.A", "=", endpoint.id).execute()
      return { ...endpoint, regions }
    }))




    return sendOutput({
      endpoints: endpointsWithRegions.map(endpoint => ({
        id: endpoint.id,
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
        auditLog: [],
        interval: endpoint.interval,
        active: Boolean(endpoint.active),
        degradedAfter: endpoint.degradedAfter,
        timeout: endpoint.timeout??0,
        distribution: endpoint.distribution as any,
        regions: endpoint.regions.map(region => region.B),
        // headers: endpoint.headers,
        body: endpoint.body,
        assertions: JSON.parse(endpoint.assertions ?? "[]"),
        // pages: endpoint.pages,
        // alerts: endpoint.alerts,
        // setup: endpoint.setup,

      }))
    });
  },

});
