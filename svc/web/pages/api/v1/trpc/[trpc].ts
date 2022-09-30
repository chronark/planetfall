// import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
// import { z } from "zod";
// import { Method, PrismaClient } from "@planetfall/db";
// import { newId } from "@planetfall/id";

// import * as trpcNext from "@trpc/server/adapters/next";
// import { requireAuth, withAuth } from "@clerk/nextjs/api";
// import { NextApiHandler, NextApiRequest } from "next";

// export type OptsWithAuth = Omit<trpcNext.CreateNextContextOptions, "req"> & {
//   req: NextApiRequest & {
//     auth?: { userId: string; getToken: () => Promise<string> };
//   };
// };

// export async function createContext(opts?: OptsWithAuth) {
//   console.warn(JSON.stringify(opts?.req?.headers, null, 2));
//   console.warn("AUTH", opts?.req.auth);
//   const userId = opts?.req.auth?.userId;
//   console.log(await opts?.req?.auth?.getToken());
//   if (!userId) {
//     throw new TRPCError({ code: "UNAUTHORIZED" });
//   }

//   return {
//     auth: {
//       userId,
//     },
//     ...opts,
//   };
// }
// export type Context = inferAsyncReturnType<typeof createContext>;

// export const t = initTRPC.context<Context>().create();

// const db = new PrismaClient();

// export const teamRouter = t.router({
//   list: t.procedure.query(async ({ ctx }) => {
//     const user = await db.user.findUnique({
//       where: {
//         id: ctx.auth.userId,
//       },
//       include: {
//         teams: {
//           include: {
//             team: true,
//           },
//         },
//       },
//     });
//     if (!user) {
//       throw new TRPCError({ code: "NOT_FOUND", message: "user not found" });
//     }
//     return user.teams;
//   }),
// });

// const router = t.router({
//   endpoint: endpointRouter,
//   teams: teamRouter,
// });

// export type Router = typeof router;
// const handler = trpcNext.createNextApiHandler({
//   router,
//   createContext,
//   onError({ error }) {
//     if (error.code === "INTERNAL_SERVER_ERROR") {
//       console.error("Something went wrong", error);
//     }
//   },

//   batching: {
//     enabled: true,
//   },
// });

// export default trpcNext.createNextApiHandler(handler);

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
