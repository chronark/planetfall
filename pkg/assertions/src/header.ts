import Ajv from "ajv"
import type { Schema } from "ajv"
import { Assertion, AssertionRequest, AssertionResponse } from "./types";


const ajv = new Ajv()

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
    const validate = ajv.compile(this.schema)
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
    return JSON.stringify(this.schema)
  }

  static deserilize(schema: string): HeaderAssertion {
    return new HeaderAssertion(JSON.parse(schema));
  }
}
