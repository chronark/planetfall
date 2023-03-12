import { assertion } from "./v2";
import { z } from "zod";
export type AssertionRequest = {
  body: string;
  header: Record<string, string>;
  status: number;
};

export type AssertionResult =
  | {
      success: true;
      message?: never;
    }
  | {
      success: false;
      message: string;
    };
export interface Assertion {
  schema: z.infer<typeof assertion>;
  assert: (req: AssertionRequest) => AssertionResult;
}
