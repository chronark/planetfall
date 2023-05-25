import { HTTPError } from "fets";
import { z } from "zod";

export const errorResponses = {
  400: z.object({
    code: z.literal("BAD_REQUEST"),
    message: z.string().optional().describe("The error message"),
  }),
  401: z.object({
    code: z.literal("UNAUTHORIZED"),
    message: z.string().optional().describe("The error message"),
  }),
  403: z.object({
    code: z.literal("FORBIDDEN"),
    message: z.string().optional().describe("The error message"),
  }),
  404: z.object({
    code: z.literal("NOT_FOUND"),
    message: z.string().optional().describe("The error message"),
  }),
  500: z.object({
    code: z.literal("INTERNAL_SERVER_ERROR"),
    message: z.string().optional().describe("The error message"),
  }),
};

export class AuthorizationError extends HTTPError {
  constructor(message: string) {
    super(403, "UNAUTHORIZED", {}, { message });
  }
}

export class NotFoundError extends HTTPError {
  constructor(message: string) {
    super(404, "NOT_FOUND", {}, { message });
  }
}

export class InternalServerError extends HTTPError {
  constructor(message: string) {
    super(500, "INTERNAL_SERVER_ERROR", {}, { message });
  }
}

export class BadRequestError extends HTTPError {
  constructor(message: string, error: z.ZodError) {
    super(400, "BAD_REQUEST", {}, { message, error });
  }
}
