import { base } from "./v2";
import { z } from "zod";
export type AssertionRequest = {
	body: string;
	header: Record<string, string>;
	status: number;
};

export interface Assertion {
	schema: z.infer<typeof base>;
	assert: (req: AssertionRequest) => boolean;
}
