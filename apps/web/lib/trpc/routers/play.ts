import { newId, newShortId } from "@planetfall/id";
import { TRPCError, unsetMarker } from "@trpc/server";
import { z } from "zod";
import { t } from "../trpc";
import { Region, db } from "@planetfall/db";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { Client as Tinybird } from "@planetfall/tinybird";
import { PingResponse } from "pages/api/v1/edge-ping/_ping";
const _tb = new Tinybird();
const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(10, "10 s"),
});

const results = z.object({
  urls: z.array(z.string().url()),
  time: z.number(),
  regions: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      checks: z.array(
        z.object({
          id: z.string(),
          url: z.string().url(),
          latency: z.number().optional(),
          time: z.number(),
          status: z.number().optional(),
          body: z.string().optional(),
          headers: z.record(z.string()).optional(),
          tags: z.array(z.string()),
          timing: z
            .object({
              dnsStart: z.number(),
              dnsDone: z.number(),
              connectStart: z.number(),
              connectDone: z.number(),
              firstByteStart: z.number(),
              firstByteDone: z.number(),
              tlsHandshakeStart: z.number(),
              tlsHandshakeDone: z.number(),
              transferStart: z.number(),
              transferDone: z.number(),
            })
            .optional(),
        }),
      ),
    }),
  ),
});

export type PlayResult = z.infer<typeof results>;

let regions: Region[] = [];

export const playRouter = t.router({
  check: t.procedure
    .input(
      z.object({
        method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
        urls: z.array(z.string().url()),
      }),
    )
    .output(z.object({ shareId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { success, remaining, reset, limit } = await ratelimit.limit(ctx.user?.id ?? "global");
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests, please try again later",
        });
      }
      ctx.res.setHeader("X-RateLimit-Limit", limit);
      ctx.res.setHeader("X-RateLimit-Remaining", remaining);
      ctx.res.setHeader("X-RateLimit-Reset", reset);

      console.log("A");
      const _start = Date.now();

      // get and cache outside of the handler
      if (regions.length === 0) {
        regions = await db.region.findMany({
          where: {
            platform: "fly",
          },
        });
      }
      console.log(
        JSON.stringify(
          regions.map((r) => r.id),
          null,
          2,
        ),
      );

      const results = await Promise.all(
        regions.map(async (region) => {
          const headers = new Headers({
            "Content-Type": "application/json",
          });

          const checks = await Promise.all(
            input.urls.map(async (url) => {
              const res = await fetch(region.url, {
                method: "POST",
                headers,
                body: JSON.stringify({
                  url,
                  method: input.method,
                  timeout: 10000,
                  prewarm: false,
                  runs: 1,
                }),
              }).catch((err) => {
                console.error(err);
                return null;
              });

              if (res === null || res.status !== 200) {
                return null;
              }
              console.log(region.url, res.status);

              const pingResponse = (await res.json()) as PingResponse[];

              const pong = pingResponse[0];
              if (!pong) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
              }

              return {
                id: newId("check"),
                time: pong.time,
                body: pong.body,
                headers: pong.headers,
                status: pong.status,
                tags: pong.tags ?? [],
                latency: pong.latency,
                // @ts-ignore this is defined for golang checkers, but not for vercel edge
                timing: pong.timing,
                url,
              };
            }),
          );

          return {
            id: region.id,
            name: region.name,
            checks,
          };
        }),
      );

      console.log(JSON.stringify({ results }, null, 2));
      const out: PlayResult = {
        urls: input.urls,
        time: Date.now(),
        regions: results.map((r) => ({
          id: r.id,
          name: r.name,
          checks: r.checks.filter((c) => c !== null) as PlayResult["regions"][0]["checks"],
        })),
      };

      for (let i = 0; i < 100; i++) {
        const id = newShortId();
        const r = await redis.set(["play", id].join(":"), out, {
          ex: ctx.user ? 90 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 90 days for authenticated, 7 for anonymous
          nx: true,
        });

        if (r !== null) {
          return { shareId: id };
        }
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Too many id collissions",
      });
    }),
});
