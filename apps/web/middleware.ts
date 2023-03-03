import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuth, withClerkMiddleware } from "@clerk/nextjs/server";

export const config = {
  matcher: "/((?!_next|_static|_vercel|[\\w-]+\\.\\w+).*)",
};

// Set the paths that don't require the user to be signed in
const publicPaths = ["/", "/pricing", "/play/*", "/auth/sign-in*", "/auth/sign-up*"];

const isPublic = (path: string) => {
  return publicPaths.find((x) => path.match(new RegExp(`^${x}$`.replace("*$", "($|/)"))));
};

function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Get hostname of request (e.g. planetfall.io, demo.localhost:3000)
  const hostname = req.headers.get("host") || "planetfall.io";
  let subdomain = hostname
    .replace("localhost:3000", "")
    .replace("planetfall.io", "")
    .replace(process.env.VERCEL_URL ?? "", "")
    .replace(/\.$/, "");
  if (subdomain.endsWith(".ngrok.io")) {
    subdomain = "";
  }
  if (subdomain === "api") {
    url.pathname = `/api${url.pathname}`;
    return NextResponse.rewrite(url);
  }
  if (subdomain !== "") {
    url.pathname = `/_statuspages/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  if (!isPublic(req.nextUrl.pathname)) {
    // if the user is not signed in redirect them to the sign in page.
    const { userId } = getAuth(req);
    if (!userId) {
      // redirect the users to /auth/sign-in
      const signInUrl = new URL("/auth/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }
}

export default withClerkMiddleware(middleware);
