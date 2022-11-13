import { JSONSchemaType } from "ajv";

export type AssertionRequest = {
	body: string;
	headers: Record<string, string>;
	status: number;
	latency: number;
};
export type AssertionResponse =
	| {
			success: true;
			error: undefined;
	  }
	| {
			success: false;
			error: string;
	  };

export type Schema =
	| JSONSchemaType<Pick<AssertionRequest, "body">>
	| JSONSchemaType<Pick<AssertionRequest, "headers">>
	| JSONSchemaType<Pick<AssertionRequest, "status">>
	| JSONSchemaType<Pick<AssertionRequest, "latency">>;

export interface Assertion {
	type: "status" | "header";
	schema: Schema;
	assert: (req: AssertionRequest) => AssertionResponse;
}
