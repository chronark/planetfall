import { db } from "@planetfall/db";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { env } from "@/lib/env";
import { NextRequest, NextResponse } from "next/server";

const validation = z.object({
  endpointId: z.string(),
});

export default async function handler(req: NextRequest) {
  try {
    if (req.method !== "POST") {
      return new NextResponse(null, { status: 405 });
    }

    const body = validation.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json(
        {
          error: body.error.message,
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json({
      // url: "",
      // headers: {},
      body: "different body",
      method: "POST",
    });
  } catch (e) {
    const err = e as Error;
    console.error(err);
    return NextResponse.json(
      {
        error: err.message,
      },
      {
        status: 500,
      },
    );
  }
}
