import { PrismaClient } from "@planetfall/db";
import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import superjson from "superjson";

import { GetServerSidePropsContext } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "@planetfall/svc/web/pages/api/auth/sign-in";

// The app's context - is generated for each incoming request

export async function createContext(opts: trpcNext.CreateNextContextOptions) {
  const req = opts?.req;
  const res = opts?.res;

  const session = req && res && (await getSession({ req, res }));

  return { session, db: new PrismaClient() };
}
export type Context = inferAsyncReturnType<typeof createContext>;
export const t = initTRPC.context<Context>().create({ transformer: superjson });

export const getSession = async (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return await unstable_getServerSession(ctx.req, ctx.res, authOptions);
};
