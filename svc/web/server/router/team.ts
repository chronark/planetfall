import { TRPCError } from "@trpc/server";
import { t } from "../trpc";

export const teamRouter = t.router({
  list: t.procedure.query(async ({ ctx }) => {
    if (!ctx.req.session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.req.session?.user?.id,
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
