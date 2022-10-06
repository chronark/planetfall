import type { NextRequest } from "next/server";
import { unsealData } from "iron-session/edge";
export default async (req: NextRequest) => {
  try {
    const sessionCookie = req.cookies.get(
      process.env.VERCEL ? "planetfall_auth" : "planetfall_auth_local",
    );
    if (!sessionCookie) {
      return new Response(JSON.stringify({ session: null }), { status: 200 });
    }
    const session = await unsealData<
      { user: { id: string; tolen: string; expires: number } }
    >(sessionCookie, { password: process.env.IRON_SESSION_SECRET! });
    if (session.user.expires <= Date.now()) {
      return new Response(JSON.stringify({ session: null }), { status: 200 });
    }
    return new Response(
      JSON.stringify({ session }),
      { status: 200 },
    );
  } catch (e) {
    const err = e as Error;
    console.error(err);
    return new Response(err.message, { status: 500 });
  }
};

export const config = {
  runtime: "experimental-edge",
};
