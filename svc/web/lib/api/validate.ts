import { ApiError } from "./error";
import { ZodObject } from "zod";

export function validate<S extends ZodObject<any>>(
	body: unknown,
	schema: S,
): S["_type"] {
	const res = schema.safeParse(body);
	if (!res.success) {
		throw new ApiError({ status: 400, message: res.error.message });
	}
	return res.data;
}
