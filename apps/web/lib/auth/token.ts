import baseX from "base-x";
import crypto from "node:crypto";

const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function newApiToken(): { token: string; hash: string } {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  const token = ["api", baseX(alphabet).encode(buf)].join("_");

  const hash = hashToken(token);

  return { token, hash };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
