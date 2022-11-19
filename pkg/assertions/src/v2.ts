import { z } from "zod";
import { JSONPath } from "jsonpath-plus";

const stringCompare = z.enum([
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
const numberCompare = z.enum(["eq", "not_eq", "gt", "gte", "lt", "lte"]);

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

const base = z.object({
	version: z.enum(["v1"]),
	type: z.string(),
});

const statusAssertion = base.merge(
	z.object({
		type: z.literal("status"),
		compare: numberCompare,
		target: z.number().int().positive(),
	}),
);

const headerAssertion = base.merge(
	z.object({
		type: z.literal("header"),
		compare: stringCompare,
		key: z.string(),
		target: z.string(),
	}),
);

const textBodyAssertion = base.merge(
	z.object({
		type: z.literal("textBody"),
		compare: stringCompare,
		target: z.string(),
	}),
);

const jsonBodyAssertion = base.merge(
	z.object({
		type: z.literal("jsonBody"),
		path: z.string(), // https://www.npmjs.com/package/jsonpath-plus
		compare: stringCompare,
		target: z.string(),
	}),
);

const assertion = z.discriminatedUnion("type", [
	statusAssertion,
	headerAssertion,
	textBodyAssertion,
	jsonBodyAssertion,
]);

class StatusAssertion {
	readonly assertion: z.infer<typeof statusAssertion>;

	constructor(assertion: z.infer<typeof statusAssertion>) {
		this.assertion = assertion;
	}

	public evaluate(req: { status: number }): boolean {
		return evaluateNumber(
			req.status,
			this.assertion.compare,
			this.assertion.target,
		);
	}
}

class HeaderAssertion {
	readonly assertion: z.infer<typeof headerAssertion>;

	constructor(assertion: z.infer<typeof headerAssertion>) {
		this.assertion = assertion;
	}

	public evaluate(req: { header: Record<string, string> }): boolean {
		return evaluateString(
			req.header[this.assertion.key],
			this.assertion.compare,
			this.assertion.target,
		);
	}
}

class TextBodyAssertion {
	readonly assertion: z.infer<typeof textBodyAssertion>;

	constructor(assertion: z.infer<typeof textBodyAssertion>) {
		this.assertion = assertion;
	}

	public evaluate(req: { body: string }): boolean {
		return evaluateString(
			req.body,
			this.assertion.compare,
			this.assertion.target,
		);
	}
}
class JsonBodyAssertion {
	readonly assertion: z.infer<typeof jsonBodyAssertion>;

	constructor(assertion: z.infer<typeof jsonBodyAssertion>) {
		this.assertion = assertion;
	}

	public evaluate(req: { body: string }): boolean {
		try {
			const json = JSON.parse(req.body);
			const value = JSONPath({ path: this.assertion.path, json });
			return evaluateString(
				value,
				this.assertion.compare,
				this.assertion.target,
			);
		} catch (e) {
			console.error("Unable to parse json");
			return false;
		}
	}
}
