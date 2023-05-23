import { Policy } from "@planetfall/policies";
import { TRPCError } from "@trpc/server";
import { db, Team } from "@planetfall/db";

export type AuthorizationResponse = {
  policy: Policy;
  team: Team;
};

export async function authorize(
  authorizationHeader: string | undefined,
): Promise<AuthorizationResponse> {
  if (!authorizationHeader) {
    throw new TRPCError({
      message: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  }
  const token = authorizationHeader.replace("Bearer ", "");

  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const hash = toBase64(buf);

  const apiKey = await db.apiKey.findUnique({
    where: {
      keyHash: hash,
    },
    include: {
      team: true,
    },
  });

  if (!apiKey) {
    throw new TRPCError({
      message: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  }

  const policy = Policy.parse(apiKey.policy);

  return {
    policy,
    team: apiKey.team,
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
