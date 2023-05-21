import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const validation = z.object({
  endpointId: z.string(),
});

export const config = {
  runtime: "edge",
};

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
