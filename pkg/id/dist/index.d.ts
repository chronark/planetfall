/// <reference types="node" />
export declare function encodeBase58(buf: Buffer): string;
/**
 * Generate ids similar to stripe
 */
export declare class IdGenerator<TPrefixes extends string> {
  private prefixes;
  /**
   * Create a new id generator with fully typed prefixes
   * @param prefixes - Relevant prefixes for your domain
   */
  constructor(prefixes: Record<TPrefixes, string>);
  /**
   * Generate a new unique base58 encoded uuid with a defined prefix
   *
   * @returns xxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   */
  id: (prefix: TPrefixes) => string;
}
export declare const newId: (
  prefix: "user" | "team" | "endpoint" | "page" | "test",
) => string;
//# sourceMappingURL=index.d.ts.map
