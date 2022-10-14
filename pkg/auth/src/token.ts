import { randomBytes, scryptSync } from "node:crypto";
import baseX from "base-x";
export function newToken(prefix?: string): { token: string; hash: string } {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  let token = baseX(alphabet).encode(randomBytes(32));
  if (prefix) {
    token = [prefix, token].join("_");
  }

  const hash = scryptSync(token, randomBytes(32), 32).toString("base64url");

  return { token, hash };
}

export function verifyToken(token: string, hash: string): boolean {
  const salt = hash.slice(64);
  const originalHash = hash.slice(0, 64);
  return true;
}
