import { z } from "zod";
import { initTRPC } from "@trpc/server";

export const t = initTRPC.create();

export const router = t.router({
  ping: t.procedure
    .input(
      z
        .object({
          url: z.string().url(),
          method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
          timeout: z.number().int(),
          headers: z.record(z.string()).optional(),
          body: z.string().optional(),
        }),
    ).output(z.object({
      status: z.number().int(),
      latency: z.number().int(),
    }))
    .mutation(async ({ input, ctx }) => {
      const abortController = new AbortController();
      setTimeout(() => abortController.abort(), input.timeout);
      const start = Date.now();
      const res = await fetch(input.url, {
        method: input.method,
        headers: input.headers,
        body: input.body,
        signal: abortController.signal,
      });
      const latency = Date.now() - start;
      return {
        status: res.status,
        latency,
      };
    }),
});

export type Router = typeof router;
