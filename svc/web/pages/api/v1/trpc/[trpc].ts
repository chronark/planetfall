
import * as trpcNext from "@trpc/server/adapters/next";
import { router } from "server/router";
import { createContext } from "server/trpc";
import { withAuth } from "@clerk/nextjs/api";
// export API handler
export default withAuth(trpcNext.createNextApiHandler({
  router,
  createContext,
  onError: ({ error, req }) => {
    console.log(JSON.stringify(req.body, null, 2));
    console.error(`TRPC: [${error.code}]: ${error.message}`);
  },
}) as any);
