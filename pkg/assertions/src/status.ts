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
  public readonly comparison: StatusComparison;
  public readonly target: number;
  public readonly version = "v1";
  constructor(comparison: StatusComparison, target: number) {
    this.comparison = comparison;
    this.target = target;
    this.schema = {
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

    this.ajv = new Ajv();
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
      const err = validate.errors[0];
      return {
        success: false,
        error: `Status error: ${err.message}, ${JSON.stringify(err.params)}`,
      };
    }
    return {
      success: false,
      error: "Something went wrong",
    };
  }

  public serialize(): string {
    return JSON.stringify({
      type: this.type,
      version: this.version,
      comparison: this.comparison,
      target: this.target,
    });
  }

  static deserilize(
    raw: { comparison: StatusComparison; target: number },
  ): StatusAssertion {
    return new StatusAssertion(raw.comparison, raw.target);
  }
}
