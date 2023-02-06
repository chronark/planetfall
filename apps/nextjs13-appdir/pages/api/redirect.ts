import { NextRequest, NextResponse } from "next/server";

export default function handler(_req: NextRequest) {
	return NextResponse.redirect("/api/hello");
}

export const config = {
	runtime: "edge",
};
