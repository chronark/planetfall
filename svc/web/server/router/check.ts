import { newId } from "@planetfall/id";
import { TRPCError } from "@trpc/server";
import { string, z } from "zod";
import { t } from "../trpc";
import { Kafka } from "@upstash/kafka";
import { StringOrTemplateHeader } from "@tanstack/react-table";

export const checkRouter = t.router({
  play: t.procedure.input(z.object({
    url: z.string().url(),
    method: z.string().transform((m) => m.toUpperCase()),
    regionIds: z.array(z.string()).min(1).max(5),
    checks: z.number().int().gte(1).lte(2).optional(),
  })).mutation(async ({ input, ctx }) => {
    const regions = await Promise.all(input.regionIds.map(async (regionId) => {
      const region = await ctx.db.region.findUnique({
        where: { id: regionId },
      });
      if (!region) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `regionId: ${regionId} not found`,
        });
      }

      const res = await fetch(region.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: input.url,
          method: input.method,
          timeout: 2000,
          checks: input.checks ?? 1,
        }),
      });
      if (res.status !== 200) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `unable to ping: ${region.id} [${res.status}]: ${await res
            .text()}`,
        });
      }

      const checks = await res.json() as {
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
        checks,
      };
    }));
    return {
      url: input.url,
      method: input.method,
      regions,
    };
  }),
  list: t.procedure.input(z.object({
    endpointId: z.string(),
    regionId: z.string().optional(),
  })).query(async ({ input, ctx }) => {
    if (!ctx.req.session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }


    const endpoint = await ctx.db.endpoint.findUnique({
      where: {
        id: input.endpointId,
      },
      include: {
        team: {
          include: {
            members: {
              where: {
                userId: ctx.req.session.user.id,
              },
            },
          },
        },

      },
    });
    if (!endpoint) {
      throw new TRPCError({ code: "NOT_FOUND", message: "endpoint not found" });
    }



    const url = new URL("https://api.tinybird.co/v0/pipes/checks_by_endpoint_24h.json")
    url.searchParams.append("endpointId", input.endpointId)
    if (input.regionId){
    url.searchParams.append("regionId", input.regionId)

    }


    const res = await fetch(url,{
      headers:{
        Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`
      }
    })

    if (res.status === 404) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Could not find checks for endpoint" })
    }
    if (res.status === 400) {
      throw new TRPCError({ code: "BAD_REQUEST", message: await res.text() })
    }


    if (res.status !== 200) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: await res.text() })
    }
    const body = await res.json() as {
      data: {
        endpointId: string,
        id: string,
        runId?:string,
        latency: number,
        regionId: string,
        status: number,
        teamId: string,
        error?: string,
        time: string,
        timing: string
        body: string,
        header: string
      }[]
    }

    console.log(JSON.stringify(body, null, 2))
    if (body.data.length === 0) {
      throw new TRPCError({ code: "NOT_FOUND", message:"No checks for endpoint" })
    }


    return body.data;
  }),
  get: t.procedure.input(z.object({
    checkId: z.string(),
  })).query(async ({ input, ctx }) => {
    if (!ctx.req.session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }


    const res = await fetch(`https://api.tinybird.co/v0/pipes/prod__check_by_id.json?checkId=${input.checkId}`, {
      headers: {
        "Authorization": `Bearer ${process.env.TINYBIRD_TOKEN}`
      }
    })
    if (res.status === 404) {
      throw new TRPCError({ code: "NOT_FOUND", message: await res.text() })
    }
    if (res.status === 400) {
      throw new TRPCError({ code: "BAD_REQUEST", message: await res.text() })
    }


    if (res.status !== 200) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: await res.text() })
    }
    const body = await res.json() as {
      data: {
        endpointId: string,
        id: string,
        latency: number,
        regionId: string,
        status: number,
        teamId: string,
        error?: string,
        time: string,
        timing: string
        body: string,
        header: string
      }[]
    }

    if (body.data.length === 0) {
      throw new TRPCError({ code: "NOT_FOUND" })
    }

    console.log(JSON.stringify(body, null, 2))

    const endpoint = await ctx.db.endpoint.findUnique({
      where: {
        id: body.data[0].endpointId,
      },
      include: {
        team: {
          include: {
            members: {
              where: {
                userId: ctx.req.session.user.id,
              },
            }
          },
        },
      }
    })
    if (!endpoint) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return {
      endpoint,
      ...body.data[0],
      timing: JSON.parse(body.data[0].timing) as {
        dnsStart: number
        dnsDone: number
        connectStart: number
        connectDone: number
        tlsHandshakeStart: number
        tlsHandshakeDone: number
        firstByteStart: number
        firstByteDone: number
        transferStart: number
        transferDone: number
      },
      header: JSON.parse(body.data[0].header) as Record<string, string>
    }
  })

});
