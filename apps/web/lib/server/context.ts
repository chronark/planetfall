import { getAuth } from "@clerk/nextjs/server";
import { inferAsyncReturnType } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
export async function createContext({ req, res }: trpcNext.CreateNextContextOptions) {
  const { userId } = getAuth(req);

  return {
    req,
    res,
    user: { id: userId },
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
