import { newId } from "@planetfall/id";
import { TRPCError } from "@trpc/server";
import { string, z } from "zod";
import { t } from "../trpc";

export const regionRouter = t.router({
  list: t.procedure.input(z.object({
    platform: z.enum(["VERCEL"]).optional(),
  })).query(async ({ input, ctx }) => {
    if (!ctx.auth.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const regions = await ctx.db.region.findMany({
      where: {
        platform: input.platform,
      },
    });
    return regions;
  }),
});
