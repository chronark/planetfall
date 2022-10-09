import { Schema, Validator } from "@cfworker/json-schema";
import { Assertion, AssertionRequest, AssertionResponse } from "./types";

export type StatusComparison = "gte" | "lte";
export class StatusAssertion implements Assertion {
  public readonly type = "status";
  public readonly schema: Schema;
  constructor(schema: Schema) {
    this.schema = schema;
  }

  static new(
    checks: { comparison: StatusComparison; target: number }[],
  ): StatusAssertion {
    const schema: Schema = {
      type: "integer",
      required: ["status"],
    };
    for (const check of checks) {
      switch (check.comparison) {
        case "gte":
          schema.minimum = check.target;

          break;

        case "lte":
          schema.maximum = check.target;

          break;
        default:
          break;
      }
    }
    return new StatusAssertion(schema);
  }

  public assert(req: AssertionRequest): AssertionResponse {
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

  static deserilize(schema: string): StatusAssertion {
    return new StatusAssertion(JSON.parse(schema));
  }
}
