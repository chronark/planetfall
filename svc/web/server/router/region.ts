import { TRPCError } from "@trpc/server";
import { t } from "../trpc";

export const regionRouter = t.router({
  list: t.procedure.query(async ({ ctx }) => {
    if (!ctx.auth.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const regions = await ctx.db.region.findMany();
    return regions;
  }),
});
