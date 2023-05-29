/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Authorizer } from "./auth";
import { AuthorizationError, BadRequestError, InternalServerError, NotFoundError } from "./errors";
import { kysely } from "./kysely";
import { router } from "./router";
import { Response } from "fets";

// Export a default object containing event handlers
const handler: ExportedHandler<Env> = {
  fetch: (req, env, ctx) => {
    const db = kysely(env.DATABASE_URL);
    const authorizer = new Authorizer(db);

    return router.handle(req, { ...ctx, env, db, authorize: authorizer.authorize });
  },
};

export default handler;
