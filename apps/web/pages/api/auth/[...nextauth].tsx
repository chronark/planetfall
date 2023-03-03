import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "@planetfall/db";
import { newId } from "@planetfall/id";
import { DEFAULT_QUOTA } from "plans";
import slugify from "slugify";
import { env } from "@/lib/env";

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;


export const authOptions: NextAuthOptions = {
  providers: [
    env.VERCEL_ENV === "preview" ? CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Email",
          type: "email",
          placeholder: "jsmith",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }
        if (credentials.password !== process.env.PREVIEW_USER_PASSWORD) {
          return null
        }

        return await db.user.findUnique({
          where: { email: credentials.username },
        });
        
      }
    }) :
      GithubProvider({
        clientId: process.env.GITHUB_OAUTH_ID!,
        clientSecret: process.env.GITHUB_OAUTH_SECRET!,
      }),
  ],

  adapter: {
    createUser: async (data) => {


      const name = data.name || data.email.split("@")[0];
      const slug = slugify(name, { lower: true, strict: true });
      const user = await db.user.create({
        data: {
          id: newId("user"),
          email: data.email,
          image: data.image,
          name,
          teams: {
            create: {
              role: "OWNER",
              team: {
                create: {
                  id: newId("team"),
                  name,
                  slug,
                  maxEndpoints: DEFAULT_QUOTA.FREE.maxEndpoints,
                  maxMonthlyRequests: DEFAULT_QUOTA.FREE.maxMonthlyRequests,
                  maxTimeout: DEFAULT_QUOTA.FREE.maxTimeout,
                  plan: "FREE",
                },
              },
            },
          },
        },
      });
      return user;
    },
    getUser: (id) => db.user.findUnique({ where: { id } }),
    getUserByEmail: (email) => db.user.findUnique({ where: { email } }),
    async getUserByAccount(provider_providerAccountId) {
      const account = await db.account.findUnique({
        where: { provider_providerAccountId },
        select: { user: true },
      });
      return account?.user ?? null;
    },
    updateUser: ({ id, ...data }) =>
      db.user.update({
        where: { id },
        data: {
          ...data,
          name: data.name || undefined,
          email: data.email || undefined,
        },
      }),
    deleteUser: (id) => db.user.delete({ where: { id } }),
    linkAccount: async (data) => {
      await db.account.create({ data });
    },
    unlinkAccount: async (provider_providerAccountId) => {
      db.account.delete({
        where: { provider_providerAccountId },
      });
    },
    async getSessionAndUser(sessionToken) {
      const session = await db.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if(!user){
        return null;
      }
      return {
        user: session.user,
        session,
      };
    },
    createSession: async (data) => {
      return await db.session.create({
        data,
      });
    },
    updateSession: (data) =>
      db.session.update({ where: { sessionToken: data.sessionToken }, data }),
    deleteSession: async (sessionToken) => {
      await db.session.delete({ where: { sessionToken } });
    },
    async createVerificationToken(data) {
      const verificationToken = await db.verificationToken.create({ data });
      // @ts-expect-errors // MongoDB needs an ID, but we don't
      if (verificationToken.id) delete verificationToken.id;
      return verificationToken;
    },
    async useVerificationToken(identifier_token) {
      return await db.verificationToken.delete({
        where: { identifier_token },
      });
    },
  },
  session: {
    strategy: "jwt",
    generateSessionToken: () => newId("session"),
  },
  cookies: {
    sessionToken: {
      name: `${VERCEL_DEPLOYMENT ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        // When working on localhost, the cookie domain must be omitted entirely (https://stackoverflow.com/a/1188145)
        domain: VERCEL_DEPLOYMENT ? "planetfall.io" : undefined,
        secure: VERCEL_DEPLOYMENT,
      },
    },
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (!token.sub) {
        throw new Error("unable to enrich user session, sub is undefined");
      }
      session.user.id = token.sub;
      return session;
    },
  },
  // events: {
  //   async signIn(message) {
  //     if (message.isNewUser) {
  //       const email = message.user.email;
  //       await Promise.all([
  //         sendMarketingMail({
  //           subject: "✨ Welcome to Dub",
  //           to: email,
  //           component: <WelcomeEmail />,
  //         }),
  //         prisma.user.update({
  //           where: { email },
  //           data: { billingCycleStart: new Date().getDate() },
  //         }),
  //       ]);
  //     }
  // },
  // },
};

export default NextAuth(authOptions);
