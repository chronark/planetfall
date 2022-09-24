import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { z } from "zod";
import { withAuth } from "@clerk/nextjs/api";
import { NextApiRequest } from "next";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@planetfall/db";
import { initTRPC } from "@trpc/server";
const db = new PrismaClient();

export async function createContext({
  req,
  res,
}: trpcNext.CreateNextContextOptions) {
  const userId = (req as { auth?: { userId?: string } }).auth?.userId;

  return {
    userId,
  };
}
export type Context = trpc.inferAsyncReturnType<typeof createContext>;
export const t = initTRPC.context<Context>().create();

export const router = t.router({
  hello: t.procedure
    .input(
      z
        .object({
          text: z.string().nullish(),
        })
        .nullish(),
    )
    .query(({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return {
        greeting: `${ctx.userId}: hello ${input?.text ?? "world"}`,
      };
    }),
});

// export type definition of API
export type Router = typeof router;

// export API handler
export default withAuth(trpcNext.createNextApiHandler({
  router,
  createContext,
}) as any);
