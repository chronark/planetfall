import { initTRPC } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { NextApiHandler } from "next";
import { z } from "zod";
import { PrismaClient } from "@planetfall/db";

export const t = initTRPC.create();

const db = new PrismaClient();

export const router = t.router({
  teams: t.procedure.input(z.object({
    clerkUserId: z.string(),
  })).output(z.array(z.object({
    id: z.string(),
    name: z.string(),
    stripeCustomerId: z.string(),
    stripeCurrentBillingPeriodStart: z.number(),
  }))).query(async ({ input, ctx }) => {
    const teams = await db.team.findMany({
      where: {
        members: {
          some: {
            user: {
              clerkId: input.clerkUserId,
            },
          },
        },
      },
    });
    return teams;
  }),
});

export type Router = typeof router;

const handler: NextApiHandler = trpcNext.createNextApiHandler({
  router,
  createContext: () => ({}),
});
export default handler;
