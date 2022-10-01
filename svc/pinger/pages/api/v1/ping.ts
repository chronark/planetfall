import { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";
import Cors from "cors";

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

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function,
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Output | ErrorOutput>,
) {
  await runMiddleware(
    req,
    res,
    Cors({
      methods: ["POST", "GET", "HEAD"],
    }),
  );

  let input: Input;

  try {
    // const token = process.env.AUTH_TOKEN;
    // if (!token) {
    //   res.status(500)
    //   res.json({ error: "AUTH_TOKEN not set" })
    //   return;
    // }
    // if (token !== req.headers.authorization) {
    //   res.status(401)
    //   res.json({ error: "Unauthorized" })
    //   return
    // }
    console.log("headers", JSON.stringify(req.headers, null, 2));
    console.info("body", req.body, "type", typeof req.body);
    input = validation.parse(req);
    console.info({ input });
  } catch (err) {
    console.error("validation error", err);
    res.status(400);
    res.json({ error: (err as ZodError).message });
    return;
  }

  // const abortController = new AbortController();
  // timeoutId = setTimeout(() => {
  //   abortController.abort();
  //   throw new Error(`Request timed out after ${input.timeout}ms`);
  // }, input.timeout);
  const start = Date.now();
  const { status } = await fetch(input.body.url, {
    method: input.body.method,
    headers: input.body.headers,
    body: input.body.body,
    // signal: abortController.signal,
  });
  const latency = Date.now() - start;
  res.json({
    status,
    latency,
  });
  return;
}
