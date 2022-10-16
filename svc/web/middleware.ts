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
  const url = req.nextUrl.clone();
  // Get hostname of request (e.g. planetfall.io, demo.localhost:3000)
  const hostname = req.headers.get("host") || "planetfall.io";

  const subdomain = hostname
    .replace(`localhost:3000`, "")
    .replace(`planetfall.io`, "")
    .replace(process.env.VERCEL_URL ?? "", "")
    .replace(/\.$/, "");

  console.log(url.pathname);

  switch (subdomain) {
    case "":
      return NextResponse.next();
    case "api":
      /**
       * Our public rest api routes are at `/pages/api/rest/vX/...`
       * but I want the public url to look like `api.planetfall.io/vX/...`
       */
      url.pathname = `/api/rest${url.pathname}`;

      break;

    default:
      url.pathname = `/_statuspages/${subdomain}`;
      break;
  }
  return NextResponse.rewrite(url);
}
