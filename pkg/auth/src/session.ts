import { IronSessionOptions } from "iron-session";

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
