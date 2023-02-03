import { NextRequest, NextResponse } from "next/server";

export default function handler(_req: NextRequest) {
	return NextResponse.json({ name: "John Doe" });
}

export const config = {
	runtime: "edge",
};
