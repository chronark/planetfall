import type { Schema } from "ajv";

export type AssertionRequest = {
  body: string;
  headers: Record<string, string>;
  status: number;
  latency: number;
};
export type AssertionResponse = {
  success: true;
} | {
  success: false;
  error: string;
};

export interface Assertion {
  type: "status" | "header";
  schema: Schema;
  assert: (req: AssertionRequest) => AssertionResponse;
}
