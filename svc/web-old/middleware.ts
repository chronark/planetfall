import { NextRequest, NextResponse } from "next/server";
import { withClerkMiddleware } from "@clerk/nextjs/server";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|static|[\\w-]+\\.\\w+).*)",
  ],
};

function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  if (url.pathname.startsWith("/docs")) {
    return NextResponse.rewrite(
      `${process.env.DOCS_URL ?? "http://localhost:3001"}${url.pathname}`,
    );
  }

  // Get hostname of request (e.g. planetfall.io, demo.localhost:3000)
  const hostname = req.headers.get("host") || "planetfall.io";

  const subdomain = hostname
    .replace(`localhost:3000`, "")
    .replace(`planetfall.io`, "")
    .replace(process.env.VERCEL_URL ?? "", "")
    .replace(/\.$/, "");

  switch (subdomain) {
    case "":
      return NextResponse.next();

    default:
      url.pathname = `/_statuspages/${subdomain}`;
      break;
  }
  return NextResponse.rewrite(url);
}

export default withClerkMiddleware(middleware);
