import { Kysely } from "kysely";
import { PlanetScaleDialect } from "kysely-planetscale";
import { DB } from 'kysely-codegen';

export const kysely = new Kysely<DB>({
    dialect: new PlanetScaleDialect({
        url: process.env.DATABASE_URL,
    }),
});
