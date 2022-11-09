import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import baseX from "base-x";
export function newToken(prefix?: string): { token: string; hash: string } {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  let token = baseX(alphabet).encode(randomBytes(32));
  if (prefix) {
    token = [prefix, token].join("_");
  }

  const hash = bcrypt.hashSync(token, 32);

  return { token, hash };
}

export function verifyToken(token: string, hash: string): boolean {
  return bcrypt.compareSync(token, hash);
}
