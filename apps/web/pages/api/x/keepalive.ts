import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

export default async function (req: NextRequest) {
  const t1 = Date.now();
  await fetch("https://planetfall.io", { keepalive: true });
  const t2 = Date.now();
  await fetch("https://planetfall.io", { keepalive: true });

  const t3 = Date.now();

  return NextResponse.json({
    cold: t2 - t1,
    hot: t3 - t2,
  });
}
