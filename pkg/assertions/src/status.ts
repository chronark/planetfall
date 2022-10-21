import Ajv from "ajv";
import {
  Assertion,
  AssertionRequest,
  AssertionResponse,
  Schema,
} from "./types";

export type StatusComparison = "gt" | "gte" | "lt" | "lte" | "eq";

export class StatusAssertion implements Assertion {
  public readonly type = "status";
  public readonly schema: Schema;
  private readonly ajv: Ajv;
  constructor(schema: Schema) {
    this.schema = schema;
    this.ajv = new Ajv();
  }

  static build(
    comparison: StatusComparison,
    target: number,
  ): StatusAssertion {
    const schema: Schema = {
      type: "object",
      properties: {
        status: {
          type: "integer",
          minimum: comparison === "gte" ? target : undefined,
          maximum: comparison === "lte" ? target : undefined,
          exclusiveMinimum: comparison === "gt" ? target : undefined,
          exclusiveMaximum: comparison === "lt" ? target : undefined,
          const: comparison === "eq" ? target : undefined,
        },
      },
      required: ["status"],
    };

    return new StatusAssertion(schema);
  }

  public assert(req: AssertionRequest): AssertionResponse {
    const validate = this.ajv.compile(this.schema);
    const valid = validate(req);
    if (valid) {
      return {
        success: true,
        error: undefined,
      };
    }
    if (validate.errors && validate.length > 0) {
      return {
        success: false,
        error: `Status error: ${validate.errors[0].message}, ${JSON.stringify(validate.errors[0])}`,
      };
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
