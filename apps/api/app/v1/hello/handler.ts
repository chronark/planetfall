import { makeRequestHandler } from "@/lib/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export const getGreeting = makeRequestHandler({
  input: z.object({}),
  output: z.object({
    greeting: z.string(),
  }),
  run: async ({ input }) => {
    return NextResponse.json({ greeting: "Hello, world" }, { status: 500 });
  },
  path: "/v1/hello",
  method: "GET",
  description: "Greets the user",
});
