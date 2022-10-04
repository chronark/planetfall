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

  console.log("Edge hostname", hostname);

  const subdomain = hostname
    .replace(`localhost:3000`, "")
    .replace(`planetfall.io`, "")
    .replace(process.env.VERCEL_URL ?? "", "")
    .replace(/\.$/, "");

  console.log("Edge current subdomain:", subdomain);

  if (subdomain === "") {
    return NextResponse.next();
  }

  url.pathname = `/_statuspages/${subdomain}`;
  console.log("Edge rewriting to ->", url.href);
  return NextResponse.rewrite(url);
}
