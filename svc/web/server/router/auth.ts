import { t } from "../trpc";
import { date, z } from "zod";
import crypto from "node:crypto";
import { TRPCError } from "@trpc/server";
import { Email } from "@planetfall/email";
import { newId } from "@planetfall/id";
import slugify from "slugify";
export const authRouter = t.router({
  requestSignUp: t.procedure.input(z.object({
    email: z.string().email(),
  })).mutation(async ({ input, ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { email: input.email },
    });
    if (user) {
      return { redirect: "/auth/sign-in" };
    }
    const otp = crypto.randomInt(999999).toString().padStart(6, "0");
    await ctx.db.verificationRequest.create({
      data: {
        identifier: input.email,
        otp,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });
    console.log("Sending OTP to", input.email);
    await new Email().sendOTP(input.email, otp);
    return {};
  }),
  requestSignIn: t.procedure.input(z.object({
    email: z.string().email(),
  })).mutation(async ({ input, ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { email: input.email },
    });
    if (!user) {
      return { redirect: "/auth/sign-up" };
    }
    const otp = crypto.randomInt(999999).toString().padStart(6, "0");
    await ctx.db.verificationRequest.create({
      data: {
        identifier: input.email,
        otp,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });
    console.log("Sending OTP to", input.email);
    await new Email().sendOTP(input.email, otp);
    return {};
  }),
  signOut: t.procedure.mutation(async ({ ctx }) => {
    if (!ctx.req.session.user?.id || !ctx.req.session.user.token) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const hash = crypto.createHash("sha256").update(ctx.req.session.user.token)
      .digest("base64");

    await ctx.db.token.delete({
      where: {
        tokenHash: hash,
      },
    });
    ctx.req.session.destroy();
  }),
  user: t.procedure.input(z.object({ userId: z.string() })).query(async ({ input, ctx }) => {
    if (!ctx.req.session.user?.id || ctx.req.session.user.id !== input.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    if (ctx.req.session.user.expires <= Date.now()) {
      ctx.req.session.destroy()
      return {
        signedIn: false
      }
    }


    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.req.session.user.id
      },
      include: {
        teams: {
          include: {
            team: true
          }
        }
      }
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    return user;
  }),
  session: t.procedure.query(async ({ ctx }) => {
    if (!ctx.req.session.user?.id || !ctx.req.session.user.token) {
      return {
        signedIn: false
      }
    }

    if (ctx.req.session.user.expires <= Date.now()) {
      ctx.req.session.destroy()
      return {
        signedIn: false
      }
    }


    return {
      userId: ctx.req.session.user.id,
      signedIn: true
    };
  }),
  verifySignIn: t.procedure.input(z.object({
    identifier: z.string(),
    otp: z.string(),
  })).mutation(async ({ input, ctx }) => {
    const req = await ctx.db.verificationRequest.findUnique({
      where: {
        identifier_otp: {
          identifier: input.identifier,
          otp: input.otp,
        },
      },
    });
    if (!req) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "otp does not exist",
      });
    }

    await ctx.db.verificationRequest.delete({
      where: {
        identifier_otp: {
          identifier: input.identifier,
          otp: input.otp,
        },
      },
    });
    if (req.expires.getTime() < Date.now()) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "otp expired" });
    }

    const user = await ctx.db.user.findUnique({
      where: {
        email: input.identifier,
      },
      include: {
        teams: {
          where: {
            role: "PERSONAL",
          },
          include: {
            team: true,
          },
        },
      },
    });
    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const token = newId("token");
    const hash = crypto.createHash("sha256").update(token).digest("base64");
    const { expires } = await ctx.db.token.create({
      data: {
        id: newId("token"),
        tokenHash: hash,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    ctx.req.session.user = {
      id: user.id,
      token: token,
      expires: expires.getTime(),
    };
    await ctx.req.session.save();
    return {
      redirect: `/${user.teams[0].team.slug}`,
    };
  }),
  verifySignUp: t.procedure.input(z.object({
    identifier: z.string(),
    name: z.string(),
    otp: z.string(),
  })).mutation(async ({ input, ctx }) => {
    const req = await ctx.db.verificationRequest.findUnique({
      where: {
        identifier_otp: {
          identifier: input.identifier,
          otp: input.otp,
        },
      },
    });
    if (!req) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "otp does not exist",
      });
    }

    await ctx.db.verificationRequest.delete({
      where: {
        identifier_otp: {
          identifier: input.identifier,
          otp: input.otp,
        },
      },
    });
    if (req.expires.getTime() < Date.now()) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "otp expired" });
    }
    const slug = slugify(input.name, { lower: true });
    const user = await ctx.db.user.create({
      data: {
        id: newId("user"),
        email: input.identifier,
        name: input.name,
        teams: {
          create: {
            role: "PERSONAL",
            team: {
              create: {
                id: newId("team"),
                name: input.name,
                slug,
                stripeCurrentBillingPeriodStart: 0,
                stripeCustomerId: crypto.randomUUID(),
                retention: 24 * 60 * 60 * 1000,
              },
            },
          },
        },
      },
    });
    const token = newId("token");
    const hash = crypto.createHash("sha256").update(token).digest("base64");
    const { expires } = await ctx.db.token.create({
      data: {
        id: newId("token"),
        tokenHash: hash,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    ctx.req.session.user = {
      id: user.id,
      token: token,
      expires: expires.getTime(),
    };
    await ctx.req.session.save();

    return { redirect: `/${slug}` };
  }),
});
