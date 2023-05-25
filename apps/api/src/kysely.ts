import { Kysely } from "kysely";
import { PlanetScaleDialect } from "kysely-planetscale";
import type { DB } from "./gen/db";

export const kysely = (
  url: string,
  cf?: {
    cacheTtl: number;
    cacheEverything: boolean;
    cacheKey: string;
  },
) =>
  new Kysely<DB>({
    dialect: new PlanetScaleDialect({
      url,
      // required for Cloudflare Workers to work with PlanetScale
      // @ts-ignore
      fetch: (url: string, init: RequestInit<RequestInitCfProperties>) => {
        delete (init as any)["cache"]; // Remove cache header
        if (cf) {
          init.cf = cf;
        }
        return fetch(url, init);
      },
    }),
  });
