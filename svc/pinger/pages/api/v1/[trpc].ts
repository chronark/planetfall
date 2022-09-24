import { z } from "zod";
import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
import { createNextApiHandler, CreateNextContextOptions } from "@trpc/server/adapters/next";

export async function createContext({
  req,
  res,
}: CreateNextContextOptions): Promise<CreateNextContextOptions> {
  const authorization = req.headers["authorization"];
  if (!authorization) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const token = process.env.AUTH_TOKEN;
  if (!token) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  }

  if (token !== authorization) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return { req, res };
}
export type Context = inferAsyncReturnType<typeof createContext>;
export const t = initTRPC.context<Context>().create();

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

// export type definition of API
export type Router = typeof router;

// export API handler
export default createNextApiHandler({
  router,
  createContext,
});
