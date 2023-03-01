import { NextRequest, NextResponse } from "next/server";
export const config = {
  runtime: "edge",
  regions: ["bom1"],
};
import { ping } from "./_ping";
export default async function handler(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const res = await ping(body);
  return NextResponse.json(res);
}
