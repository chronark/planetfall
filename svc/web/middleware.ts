import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    "/",
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  // Get hostname of request (e.g. planetfall.io, demo.localhost:3000)
  const hostname = req.headers.get("host") || "planetfall.io";

  console.log("Edge hostname", hostname)

  const subdomain = hostname
    .replace(`localhost:3000`, "")
    .replace(`planetfall.io`, "")
    .replace(process.env.VERCEL_URL ?? "", "")
    .replace(/\.$/, "")


  console.log("Edge current subdomain:", subdomain)
  switch (subdomain) {
    case "":
      break;
    //  case "app":
    //    url.pathname = `/app${url.pathname}`;
    //    break;
    default:
      url.pathname = `/_statuspages/${subdomain}`
  }
  console.log("Edge redirect to ->", url.href);
  return NextResponse.rewrite(url);
}
