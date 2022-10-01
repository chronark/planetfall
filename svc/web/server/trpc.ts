import { PrismaClient } from "@planetfall/db";
import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import superjson from "superjson";
// The app's context - is generated for each incoming request
export async function createContext(opts?: trpcNext.CreateNextContextOptions) {
  // @ts-ignore clerk withAuth will provide this
  const userId = opts?.req?.auth?.userId as string | undefined;

  return {
    db: new PrismaClient(),
    auth: {
      userId,
    },
  };
}
export type Context = inferAsyncReturnType<typeof createContext>;
export const t = initTRPC.context<Context>().create({ transformer: superjson });
