import type { DB } from "@/gen/db";
import { Kysely } from "kysely";
import { PlanetScaleDialect } from "kysely-planetscale";

export const kysely = new Kysely<DB>({
  dialect: new PlanetScaleDialect({
    url: process.env.DATABASE_URL,
  }),
});
