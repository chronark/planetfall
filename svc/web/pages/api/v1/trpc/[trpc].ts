import { initTRPC, TRPCError } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { NextApiHandler } from "next";
import { z } from "zod";
import { PrismaClient } from "@planetfall/db";

export const t = initTRPC.create();

const db = new PrismaClient();

export const router = t.router({
  teams: t.procedure.input(z.object({
    clerkUserId: z.string(),
  })).query(async ({ input, ctx }) => {
    const user = await db.user.findUnique({
      where: {
        clerkId: input.clerkUserId,
      },
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "user not found" });
    }
    console.log({ user });
    return user.teams.map((membership) => membership.team);
  }),
});

export type Router = typeof router;

const handler: NextApiHandler = trpcNext.createNextApiHandler({
  router,
  createContext: () => ({}),
});
export default handler;
