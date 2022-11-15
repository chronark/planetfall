import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = {
	matcher: "/((?!_next|_static|_vercel|api|[\\w-]+\\.\\w+).*)",
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
	switch (subdomain) {
		case "api": {
			url.pathname = `/api${url.pathname}`;
			return NextResponse.rewrite(url);
		}

		default:
			url.pathname = `/_statuspages/${subdomain}`;
			return NextResponse.rewrite(url);
	}
}

export default middleware;
