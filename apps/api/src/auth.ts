import type { Bindings } from "./bindings";
import { AuthorizationError } from "./errors";
import type { Team } from "./gen/db";
import { kysely } from "./kysely";
import { Policy } from "@planetfall/policies";
import { Context } from "hono";

export type AuthorizationResponse = {
  policy: Policy;
  team: {
    id: Team["id"];
  };
};

export async function authorize(
  c: Context<{ Bindings: Bindings }>,
): Promise<AuthorizationResponse> {
  const authorizationHeader = c.req.header("authorization");

  if (!authorizationHeader) {
    throw new AuthorizationError("Missing authorization header");
  }
  const token = authorizationHeader.replace("Bearer ", "");

  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));

  const hash = toBase64(buf);

  const apiKey = await kysely(c.env.DATABASE_URL)
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

function toBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
