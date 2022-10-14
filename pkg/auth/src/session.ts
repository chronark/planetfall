import { IronSessionOptions } from "iron-session";
import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler,
} from "next";

const password = process.env.IRON_SESSION_SECRET;
if (!password) {
  throw new Error("IRON_SESSION_SECRET is missing from env");
}
export const options: IronSessionOptions = {
  cookieName: process.env.VERCEL ? "planetfall_auth" : "planetfall_auth_local",
  password,
  cookieOptions: {
    secure: !!process.env.VERCEL,
  },
};

export function withSessionRoute(handler: NextApiHandler) {
  return withIronSessionApiRoute(handler, options);
}

// Theses types are compatible with InferGetStaticPropsType https://nextjs.org/docs/basic-features/data-fetching#typescript-use-getstaticprops
export function withSessionSsr<
  P extends { [key: string]: unknown } = { [key: string]: unknown },
>(
  handler: (
    context: GetServerSidePropsContext,
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
) {
  return withIronSessionSsr(handler, options);
}

export async function storeSession(): Promise<void> {
}
