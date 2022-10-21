import type { Assertion } from "./types";

import { StatusAssertion } from "./status";
export function serialize(
  assertions: Assertion[],
): { type: string; schema: unknown }[] {
  return assertions.map((a) => ({
    type: a.type,
    schema: a.schema,
  }));
}

export function deserialize(
  raw: { type: string; schema: unknown }[],
): Assertion[] {
  return raw.map((r) => {
    switch (r.type) {
      case "status":
        return StatusAssertion.deserilize(r.schema as any);

      default:
        throw new Error(`unknown assertion type: ${r.type}`);
    }
  });
}
