import { Response, createRouter, useErrorHandling } from 'fets'
import { z } from "zod"
import { kysely } from "../kysely"
import { AuthorizationError, BadRequestError, InternalServerError, NotFoundError, errorResponses } from "../errors"
import { AuthorizationResponse } from "../auth"
import { Kysely } from "kysely"
import { DB } from "../gen/db"



export type Context = ExecutionContext & {
  env: Env
  authorize: (authorizationHeader: string | null) => Promise<AuthorizationResponse>
  db: Kysely<DB>
}

export const router = createRouter<Context>({
  openAPI: {
    info: {
      title: 'Planetfall API',
      description: 'The API for planetfall.io',
      version: '1.0.0'
    }

  },
  plugins: [
    useErrorHandling()
  ]
})


router.route({
  method: 'GET',
  path: '/v1/regions',
  schemas: {
    responses: {
      ...errorResponses,
      200: z.array(z.object({
        id: z.string().describe("The region's internal planetfall id"),
        platform: z.enum(["fly", "aws", "vercelEdge"]).describe("The platform the region is hosted on. We use different cloud providers to offer as many regions as possible."),
        region: z.string().describe("The region's name according to the cloud provider"),

      })).describe("Returns a list of all regions that are currently available"),
    }
  } as const,
  handler: async (req, ctx) => {


    const regions = await ctx.db.selectFrom("Region").select("Region.id").select("Region.platform").select("Region.region").where("Region.visible", "=", 1).execute()

    return Response.json(regions, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600"
      }
    })
  }
})


router.route({
  method: 'GET',
  path: '/v1/endpoints',
  schemas: {
    request: {
      headers: z.object({
        Authorization: z.string().regex(/Bearer .+/)
      })
    },
    responses: {
      ...errorResponses,
      200: z.array(z.object({
        id: z.string().describe("The endpoint's id. You can see this in the URL when you open the endpoint in the dashboard."),
        name: z.string().describe("The endpoint's name."),
        url: z.string().url().describe("The endpoint's url."),
      }))
    }
  },
  handler: async (req, ctx) => {

    const { policy, team } = await ctx.authorize(req.headers.get("Authorization"))


    const endpoints = await kysely(ctx.env.DATABASE_URL).selectFrom("Endpoint").selectAll().where("teamId", "=", team.id).execute()

    const allowedEndpoints = endpoints.filter(e => {
      const access = policy.validate("endpoint:read", `${team.id}::endpoint::${e.id}`)
      if (!access.valid) {
        console.warn(`Access denied for ${team.id}::endpoint::${e.id} - ${access.error}`)
      }
      return access.valid
    })

    return Response.json(allowedEndpoints.map(e => ({
      id: e.id,
      name: e.name,
      url: e.url
    })), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      }
    })



  }
})



router.route({
  method: 'GET',
  path: '/v1/endpoints/{endpointId}',
  description: "Returns information about a specific endpoint",
  schemas: {
    request: {
      headers: z.object({
        authorization: z.string().regex(/Bearer .+/)
      }),
      params: z.object({
        endpointId: z.string()
      })
    },
    responses: {
      ...errorResponses,
      200: z.object({
        id: z.string().describe("The endpoint's id. You can see this in the URL when you open the endpoint in the dashboard."),
        name: z.string().describe("The endpoint's name."),
        url: z.string().url().describe("The endpoint's url."),
      })
    }
  },
  handler: async (req, ctx) => {

    const { policy, team } = await ctx.authorize(req.headers.get("authorization"))
    const access = policy.validate("endpoint:read", `${team.id}::endpoint::${req.params.endpointId}`)
    if (!access.valid) {
      throw new AuthorizationError(access.error)
    }

    const endpoints = await kysely(ctx.env.DATABASE_URL).selectFrom("Endpoint").selectAll().where("teamId", "=", team.id).execute()

    const allowedEndpoints = endpoints.filter(e => {
      const access = policy.validate("endpoint:read", `${team.id}::endpoint::${e.id}`)
      if (!access.valid) {
        console.warn(`Access denied for ${team.id}::endpoint::${e.id} - ${access.error}`)
      }
      return access.valid
    })

    return new Response(JSON.stringify(allowedEndpoints.map(e => ({
      id: e.id,
      name: e.name,
      url: e.url
    }))), {
      headers: {
        "Content-Type": "application/json",
      }
    })
  }
})


router.route({
  operationId: "whoami",
  method: 'GET',
  path: '/v1/whoami',
  description: "Returns information about the currently authenticated team",
  tags: ["teams"],
  schemas: {
    request: {
      headers: z.object({
        Authorization: z.string().regex(/Bearer .+/)
      })
    },
    responses: {
      ...errorResponses,
      200: z.object({
        id: z.string().describe("The team's unique id."),
        name: z.string().describe("The team's name."),
        slug: z.string().describe("The team's slug. This is used in the url when you open the team in the dashboard."),
        createdAt: z.number().describe("The timestamp when the team was created. This is a unix timestamp in milliseconds."),
        plan: z.enum(["FREE", "PRO", "ENTERPRISE"]).describe("The team's current plan."),
        maxMonthlyRequests: z.number().describe("The maximum number of requests the team can make per month."),
        maxEndpoints: z.number().describe("The maximum number of endpoints the team can create."),
        maxTimeout: z.number().describe("The maximum timeout in milliseconds the team can set for an endpoint."),
        maxPages: z.number().describe("The maximum number of pages the team can set for an endpoint."),
      }),

    }
  } as const,
  handler: async (req, ctx) => {

    const { team: { id } } = await ctx.authorize(req.headers.get("Authorization"))
    
    const team = await ctx.db.selectFrom("Team")
      .select("id")
      .select("name")
      .select("slug")
      .select("createdAt")
      .select("plan")
      .select("maxMonthlyRequests")
      .select("maxEndpoints")
      .select("maxTimeout")
      .select("maxPages")
      .where("id", "=", id)
      .executeTakeFirst()
    if (!team) {
      throw new NotFoundError("Team not found")
    }

    return Response.json(team)
  }
})



export type Router = typeof router