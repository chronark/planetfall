import { NextApiHandler } from "next";
import { ApiError } from "./error";

export type Middleware = (h: NextApiHandler) => NextApiHandler;

export function withMiddleware(
  handler: NextApiHandler,
  ...middlewares: Middleware[]
): NextApiHandler {
  return middlewares.reduce((h, mw) => mw(h), handler);
}

export function withRecoverer(): Middleware {
  return (h: NextApiHandler) => (req, res) => {
    try {
      return h(req, res);
    } catch (e) {
      console.error(`Recovered from error: ${(e as Error).message}`);

      if (e instanceof ApiError) {
        res.status(e.status).json({
          error: { code: e.status.toString(), message: e.message },
        });
        return;
      }
      res.status(500).json({
        error: { code: "unexpected", message: (e as Error).message },
      });
    }
  };
}

export function withMethods(...methods: string[]): Middleware {
  return (h: NextApiHandler) => (req, res) => {
    if (!(req.method && methods.map((m) => m.toUpperCase()).includes(req.method?.toUpperCase()))) {
      throw new ApiError({
        status: 405,
        message: `Method ${req.method} not allowed`,
      });
    }

    return h(req, res);
  };
}
