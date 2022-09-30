import { randomUUID } from "node:crypto";

import baseX from "base-x";

export function encodeBase58(buf: Buffer): string {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  return baseX(alphabet).encode(buf);
}
/**
 * Generate ids similar to stripe
 */
export class IdGenerator<TPrefixes extends string> {
  private prefixes: Record<TPrefixes, string>;

  /**
   * Create a new id generator with fully typed prefixes
   * @param prefixes - Relevant prefixes for your domain
   */
  constructor(prefixes: Record<TPrefixes, string>) {
    this.prefixes = prefixes;
  }

  /**
   * Generate a new unique base58 encoded uuid with a defined prefix
   *
   * @returns xxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   */
  public id = (prefix: TPrefixes): string => {
    return [
      this.prefixes[prefix],
      encodeBase58(Buffer.from(randomUUID().replace(/-/g, ""), "hex")),
    ].join("_");
  };
}

export const newId = new IdGenerator({
  user: "user",
  team: "team",
  endpoint: "ept",
  page: "page",
  test: "test",
}).id;
