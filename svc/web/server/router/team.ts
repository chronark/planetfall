import { TRPCError } from "@trpc/server";
import { t } from "../trpc";

export const teamRouter = t.router({
  list: t.procedure.query(async ({ ctx }) => {
    console.log({auth: ctx.auth})
    if (!ctx.auth.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.auth.userId,
      },
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "user not found" });
    }
    return user.teams;
  }),
});
