import { withSessionRoute } from "@planetfall/auth";
import * as trpcNext from "@trpc/server/adapters/next";
import { NextApiRequest, NextApiResponse } from "next";
import { router } from "server/router";
import { createContext } from "server/trpc";

const handler = trpcNext.createNextApiHandler({
  router,
  createContext,
  onError: ({ error, req, path }) => {
    console.error(`TRPC: [${path}] [${error.code}]: ${error.message}`);
  },
});

export default withSessionRoute((req, res) => {
  console.time(req.url?.split("?")[0])
  const x = handler(req, res);
  console.timeEnd(req.url?.split("?")[0])
  return x
});
