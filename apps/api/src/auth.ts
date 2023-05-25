import { Policy } from "@planetfall/policies";
// import { TRPCError } from "@trpc/server";
import type { DB, Team } from "./gen/db";
import { AuthorizationError } from "./errors";
import type { Kysely } from "kysely";

export type AuthorizationResponse = {
  policy: Policy;
  team: {
    id: Team["id"];
  };
};

export class Authorizer {
  private readonly db: Kysely<DB>;

  constructor(db: Kysely<DB>) {
    this.db = db;
  }
  public async authorize(authorizationHeader: string | null): Promise<AuthorizationResponse> {
    if (!authorizationHeader) {
      throw new AuthorizationError("Missing authorization header");
    }
    const token = authorizationHeader.replace("Bearer ", "");

    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));

    const hash = toBase64(buf);

    const apiKey = await this.db
      .selectFrom("ApiKey")
      .select("ApiKey.policy")
      .select("ApiKey.teamId")
      .where("ApiKey.keyHash", "=", hash)
      .executeTakeFirst();

    if (!apiKey) {
      throw new AuthorizationError("Unauthorized, invalid api key");
    }

    const policy = Policy.parse(apiKey.policy);

    return {
      policy,
      team: {
        id: apiKey.teamId,
      },
    };
  }
}
function toBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
