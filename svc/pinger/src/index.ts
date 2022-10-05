import { z } from "zod";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const validation = z.object({
  headers: z.object({
    "content-type": z.enum(["application/json"]),
  }),
  body: z.object({
    url: z.string().url(),
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
    // milliseconds
    // timeout: z.number().int().gte(1000).lte(60000),
    headers: z.record(z.string()).nullish(),
    body: z.string().nullish(),
  }),
});
export type Input = z.infer<typeof validation>;
export type Output = {
  status: number;
  latency: number;
};
export type ErrorOutput = {
  error: string;
};

export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return {
      statusCode: 400,
      body: "Body is required",
    };
  }

  console.info("body", event.body, "type", typeof event.body);
  const v = validation.safeParse(JSON.parse(event.body));
  if (!v.success) {
    console.error("");
    return {
      statusCode: 400,
      body: v.error.message,
    };
  }

  // const abortController = new AbortController();
  // const timeoutId = setTimeout(() => {
  //   abortController.abort();
  //   throw new Error(`Request timed out after ${v.data.body.timeout}ms`);
  // }, v.data.body.timeout);

  const start = Date.now();
  const { status } = await fetch(v.data.body.url, {
    method: v.data.body.method,
    headers: v.data.body.headers ?? undefined,
    body: v.data.body.body,
    // signal: abortController.signal,
  });
  const latency = Date.now() - start;
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, latency }),
  };
}
