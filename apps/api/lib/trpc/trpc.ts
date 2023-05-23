import { initTRPC } from "@trpc/server";

import { Context } from "./context";
import { authorize } from "@/lib/auth";
import { OpenApiMeta } from "trpc-openapi";

export const t = initTRPC
  .context<Context>()
  .meta<OpenApiMeta>()
  .create({
    errorFormatter: ({ error, shape }) => {
      console.error("[TRPC]", error)
      if (error.code === "INTERNAL_SERVER_ERROR" && process.env.NODE_ENV === "production") {
        return { ...shape, message: "Internal server error" };
      }


      return shape;
    },
  });

export const auth = t.middleware(async ({ next, ctx }) => {
  const auth = await authorize(ctx.authorization);

  console.log("[TRPC] Policy", auth.policy)
  return next({
    ctx: {
      ...ctx,
      auth,
    },
  });
});
