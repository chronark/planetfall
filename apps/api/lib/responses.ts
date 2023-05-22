import { NextResponse } from "next/server";
import { oas31 } from "openapi3-ts";

export const commonReponses = {
  405: {
    openAPISchema: {
      description: "Method not allowed",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              error: {
                type: "string",
              },
            },
          },
        },
      },
    },
    response: () =>
      NextResponse.json(
        { error: "Method not allowed" },
        {
          status: 405,
        },
      ),
  },
  400: {
    openAPISchema: {
      description: "Bad request",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              error: {
                type: "string",
              },
              details: {
                type: "object",
              },
            },
          },
        },
      },
    },
    response: (details: Record<string, any>) =>
      NextResponse.json(
        { error: "Bad request", details },
        {
          status: 400,
        },
      ),
  },
  401: {
    openAPISchema: {
      description: "Unauthorized",
    },
    response: () => new NextResponse(null, { status: 401 }),
  },
  500: {
    openAPISchema: {
      description: "Internal Server Error",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              error: {
                type: "string",
              },
              details: {
                type: "object",
              },
            },
          },
        },
      },
    },
    response: (message?: string) =>
      NextResponse.json(
        { error: "Internal Server Error", message },
        {
          status: 400,
        },
      ),
  },
} satisfies Record<
  string,
  {
    openAPISchema: oas31.ResponseObject;
    response: (props: any) => Response;
  }
>;
