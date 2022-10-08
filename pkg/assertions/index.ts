export * from "./src/status";
export * from "./src/header";
import { Schema } from "@cfworker/json-schema";
import { HeaderAssertion } from "./src/header";
import { StatusAssertion } from "./src/status";
import type { Assertion } from "./src/types";

export function serialize(
  assertions: Assertion[],
): { type: string; schema: Schema }[] {
  return assertions.map((a) => ({
    type: a.type,
    schema: a.schema,
  }));
}

export function deserialize(
  raw: { type: string; schema: Schema }[],
): Assertion[] {
  return raw.map((r) => {
    switch (r.type) {
      case "status":
        return new StatusAssertion(r.schema);
      case "header":
        return new HeaderAssertion(r.schema);
      default:
        throw new Error(`unknown assertion type: ${r.type}`);
    }
  });
}
