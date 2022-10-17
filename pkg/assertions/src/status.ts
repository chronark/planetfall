import Ajv from "ajv"
import type { Schema } from "ajv"
import { Assertion, AssertionRequest, AssertionResponse } from "./types";



export type StatusComparison = "gte" | "lte" | "eq";
export class StatusAssertion implements Assertion {
  public readonly type = "status";
  public readonly schema: Schema;
  private readonly ajv: Ajv
  constructor(schema: Schema) {
    this.schema = schema;
    this.ajv = new Ajv()
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
    const validate = this.ajv.compile(this.schema)
    const valid = validate(req);
    if (valid) {
      return {
        success: true,
      };
    }
    if (validate.errors && validate.length > 0) {
      return {
        success: false,
        error: validate.errors[0].message ?? "Something went wromg"
      }
    }
    return {
      success: false,
      error: "Something went wrong",
    };
  }

  public serialize(): string {
    return JSON.stringify(this.schema);
  }

  static deserilize(schema: string): StatusAssertion {
    return new StatusAssertion(JSON.parse(schema));
  }
}
