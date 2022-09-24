import { createNextApiHandler } from "@trpc/server/adapters/next";
import { router } from "@planetfall/ping";
import { TRPCError } from "@trpc/server";

// export API handler
export default createNextApiHandler({
  router,
  createContext: async (ctx) => {
    const authorization = ctx.req.headers["authorization"];
    if (!authorization) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const token = process.env.AUTH_TOKEN;
    if (!token) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    if (token !== authorization) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return ctx;
  },
});
