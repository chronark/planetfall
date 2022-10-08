import { z } from "zod";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import "isomorphic-fetch";

const validation = z.object({
  url: z.string().url(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  // milliseconds
  // timeout: z.number().int().gte(1000).lte(60000),
  headers: z.record(z.string()).nullish(),
  body: z.string().optional(),
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
  try {
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
    console.log("Sending body: ", v.data.body);
    const { status } = await fetch(v.data.url, {
      method: v.data.method,
      headers: {
        "User-Agent": "planetfall.io",
        ...v.data.headers,
      },
      body: v.data.body,
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
  } catch (e) {
    const err = e as Error;
    console.error(err.message);
    return {
      statusCode: 500,
      body: err.message,
    };
  }
}
