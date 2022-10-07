import { NextRequest, NextResponse } from "next/server";
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

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  // Get hostname of request (e.g. planetfall.io, demo.localhost:3000)
  const hostname = req.headers.get("host") || "planetfall.io";

  const subdomain = hostname
    .replace(`localhost:3000`, "")
    .replace(`planetfall.io`, "")
    .replace(process.env.VERCEL_URL ?? "", "")
    .replace(/\.$/, "");

  if (subdomain === "") {
    return NextResponse.next();
  }

  url.pathname = `/_statuspages/${subdomain}`;
  return NextResponse.rewrite(url);
}
