import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { withClerkMiddleware } from "@clerk/nextjs/server";

export const config = {
	matcher: [
		"/((?!.*\\.).*)"
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
	let subdomain = hostname
		.replace("localhost:3000", "")
		.replace("planetfall.io", "")
		.replace(process.env.VERCEL_URL ?? "", "")
		.replace(/^\./, "");
	if (subdomain.endsWith(".ngrok.io")) {
		subdomain = "";
	}

	if (subdomain !== "") {
		url.pathname = `/_statuspages/${subdomain}`;
		console.log("MW: rewriting: ", url.toString())
		for (const key of url.searchParams.keys()) {
			url.searchParams.delete(key);
		}

		return NextResponse.rewrite(url);
	}

	return NextResponse.next();
}

export default withClerkMiddleware(middleware);
