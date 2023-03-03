import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withClerkMiddleware } from "@clerk/nextjs/server";

export const config = {
  matcher: "/((?!.*\\.).*)",
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
  return NextResponse.next();
}

export default withClerkMiddleware(middleware);
