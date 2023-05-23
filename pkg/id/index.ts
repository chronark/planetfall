import { adjectives, animals } from "./constants";
import baseX from "base-x";
import { randomBytes, randomInt, randomUUID } from "node:crypto";

function encodeBase58(buf: Buffer): string {
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
    const time = Buffer.alloc(8);
    time.writeDoubleBE(Date.now(), 0);
    const buf = Buffer.concat([time, randomBytes(16)]);

    return [this.prefixes[prefix], encodeBase58(buf)].join("_");
  };
}

export const newId = new IdGenerator({
  apiKey: "pf_api",
  apiKeyId: "api",
  alert: "alrt",
  audit: "aud",
  channel: "chan",
  invitation: "inv",
  session: "sess",
  user: "user",
  team: "team",
  endpoint: "ept",
  page: "page",
  check: "chk",
  token: "tkn",
  jwt: "jwt",
  run: "run",
}).id;

export const newShortId = () => encodeBase58(randomBytes(8));

export const newAnimalId = () =>
  [adjectives[randomInt(0, adjectives.length - 1)], animals[randomInt(0, animals.length - 1)]].join(
    "-",
  );
