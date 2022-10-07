import { PrismaClient } from "@planetfall/db";
import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import superjson from "superjson";

import { GetServerSidePropsContext } from "next";
import { withSessionRoute } from "@planetfall/auth";

// The app's context - is generated for each incoming request

export async function createContext(
  { req, res }: trpcNext.CreateNextContextOptions,
) {
  return { db: new PrismaClient(), req, res };
}
export type Context = inferAsyncReturnType<typeof createContext>;
export const t = initTRPC.context<Context>().create({ transformer: superjson });
