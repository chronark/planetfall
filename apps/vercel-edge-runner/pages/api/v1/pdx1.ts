import { NextRequest, NextResponse } from "next/server";
export const config = {
  runtime: "edge",
  regions: ["pdx1"],
};
import { ping } from "./_ping";
export default async function handler(req: NextRequest): Promise<NextResponse> {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
 const body = await req.json();
  const res = await ping(body);
  return NextResponse.json(res);
}
