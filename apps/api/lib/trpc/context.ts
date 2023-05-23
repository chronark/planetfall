import { inferAsyncReturnType } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";

// eslint-disable-next-line @typescript-eslint/require-await
export const createContext = async ({ req, res }: CreateNextContextOptions) => {
  const requestId = crypto.randomUUID();
  res.setHeader("x-request-id", requestId);

  const authorization = req.headers["authorization"];

  return { requestId, authorization };
};

export type Context = inferAsyncReturnType<typeof createContext>;
