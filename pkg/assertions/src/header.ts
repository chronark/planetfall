import { Schema, Validator } from "@cfworker/json-schema";
import { Assertion, AssertionRequest, AssertionResponse } from "./types";

export type HeaderComparison = "eq" | "exists";
export class HeaderAssertion implements Assertion {
  public readonly type = "header";

  public readonly schema: Schema;
  constructor(schema: Schema) {
    this.schema = schema;
  }

  static new(
    checks: { comparison: HeaderComparison; key: string; target?: string }[],
  ): HeaderAssertion {
    const schema: Schema = {
      type: "object",
      properties: {},
      required: [],
    };
    for (const check of checks) {
      console.log({ check });
      switch (check.comparison) {
        case "eq":
          schema.properties![check.key] = {
            type: "string",
            const: check.target,
          };
          schema.required?.push(check.key);
          break;

        case "exists":
          schema.required?.push(check.key);
          break;

        default:
          break;
      }
    }
    return new HeaderAssertion(schema);
  }

  public assert(req: AssertionRequest): AssertionResponse {
    console.log(JSON.stringify({ req, schema: this.schema }, null, 2));
    const res = new Validator(this.schema).validate(req);
    if (res.valid) {
      return {
        success: true,
      };
    }
    return {
      success: false,
      error: res.errors[0].error,
    };
  }

  public serialize(): string {
    return JSON.stringify(this.schema);
  }

  static deserilize(schema: string): HeaderAssertion {
    return new HeaderAssertion(JSON.parse(schema));
  }
}
