import { z } from "zod";
import { JSONPath } from "jsonpath-plus";
import { Assertion, AssertionRequest } from "./types";

export const stringCompare = z.enum([
	"contains",
	"not_contains",
	"eq",
	"not_eq",
	"empty",
	"not_empty",
	"gt",
	"gte",
	"lt",
	"lte",
]);
export const numberCompare = z.enum(["eq", "not_eq", "gt", "gte", "lt", "lte"]);

function evaluateNumber(
	value: number,
	compare: z.infer<typeof numberCompare>,
	target: number,
): boolean {
	switch (compare) {
		case "eq":
			return value === target;
		case "not_eq":
			return value !== target;
		case "gt":
			return value > target;
		case "gte":
			return value >= target;
		case "lt":
			return value < target;
		case "lte":
			return value <= target;
	}
}

function evaluateString(
	value: string,
	compare: z.infer<typeof stringCompare>,
	target: string,
): boolean {
	switch (compare) {
		case "contains":
			return value.includes(target);
		case "not_contains":
			return !value.includes(target);
		case "empty":
			return value === "";
		case "not_empty":
			return value !== "";
		case "eq":
			return value === target;
		case "not_eq":
			return value !== target;
		case "gt":
			return value > target;
		case "gte":
			return value >= target;
		case "lt":
			return value < target;
		case "lte":
			return value <= target;
	}
}

export const base = z
	.object({
		version: z.enum(["v1"]),
		type: z.string(),
	})
	.passthrough();
export const statusAssertion = base.merge(
	z.object({
		type: z.literal("status"),
		compare: numberCompare,
		target: z.number().int().positive(),
	}),
);

export const headerAssertion = base.merge(
	z.object({
		type: z.literal("header"),
		compare: stringCompare,
		key: z.string(),
		target: z.string(),
	}),
);

export const textBodyAssertion = base.merge(
	z.object({
		type: z.literal("textBody"),
		compare: stringCompare,
		target: z.string(),
	}),
);

export const jsonBodyAssertion = base.merge(
	z.object({
		type: z.literal("jsonBody"),
		path: z.string(), // https://www.npmjs.com/package/jsonpath-plus
		compare: stringCompare,
		target: z.string(),
	}),
);

export const assertion = z.discriminatedUnion("type", [
	statusAssertion,
	headerAssertion,
	textBodyAssertion,
	jsonBodyAssertion,
]);

export class StatusAssertion implements Assertion {
	readonly schema: z.infer<typeof statusAssertion>;

	constructor(schema: z.infer<typeof statusAssertion>) {
		this.schema = schema;
	}

	public assert(req: AssertionRequest): boolean {
		return evaluateNumber(req.status, this.schema.compare, this.schema.target);
	}
}

export class HeaderAssertion {
	readonly schema: z.infer<typeof headerAssertion>;

	constructor(schema: z.infer<typeof headerAssertion>) {
		this.schema = schema;
	}

	public assert(req: AssertionRequest): boolean {
		return evaluateString(
			req.header[this.schema.key],
			this.schema.compare,
			this.schema.target,
		);
	}
}

export class TextBodyAssertion {
	readonly schema: z.infer<typeof textBodyAssertion>;

	constructor(schema: z.infer<typeof textBodyAssertion>) {
		this.schema = schema;
	}

	public assert(req: AssertionRequest): boolean {
		return evaluateString(req.body, this.schema.compare, this.schema.target);
	}
}
export class JsonBodyAssertion implements Assertion {
	readonly schema: z.infer<typeof jsonBodyAssertion>;

	constructor(schema: z.infer<typeof jsonBodyAssertion>) {
		this.schema = schema;
	}

	public assert(req: AssertionRequest): boolean {
		try {
			const json = JSON.parse(req.body);
			const value = JSONPath({ path: this.schema.path, json });
			return evaluateString(value, this.schema.compare, this.schema.target);
		} catch (e) {
			console.error("Unable to parse json");
			return false;
		}
	}
}
