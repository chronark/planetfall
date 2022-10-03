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

  console.log()

  let currentHost = hostname
    .replace(`.localhost:3000`, "")
    .replace(`.planetfall.io`, "")
  if (process.env.VERCEL_URL) {
    currentHost = currentHost.replace(`.${process.env.VERCEL_URL}`, "")
  }

  console.log("Edge current host:", currentHost)
  switch (currentHost) {
    case "":
      break;
    //  case "app":
    //    url.pathname = `/app${url.pathname}`;
    //    break;
    default:
      url.pathname = `/_statuspages/${currentHost}`.replace(
        /\/$/,
        "",
      );
  }
  console.log("Edge redirect to ->", url.href);
  return NextResponse.rewrite(url);
}
