import { NextRequest, NextResponse } from "next/server";
import { getEndpoints } from "../endpoints/handler";
import { getEndpoint } from "../endpoints/[endpointId]/handler";

import { OpenAPIObject, OpenAPIPathsObject } from "@/lib/utils";

// it's ugly, I know, but this nicely combines
// multiple openAPI definitions from different route handlers :)
const pathsObject: OpenAPIPathsObject = [
  getEndpoint.openAPIPathsObject,
  getEndpoints.openAPIPathsObject,
  // ...add others here
].reduce((acc, curr) => {
  Object.keys(curr).forEach((k) => {
    acc[k] = {
      ...acc[k],
      ...curr[k],
    };
  });
  return acc;
}, {});

const document: OpenAPIObject = {
  info: {
    title: "Planetfall API",
    version: "1.0.0",
  },
  openapi: "3.0.0",
  paths: pathsObject,
  externalDocs: {
    description: "Find out more about Planetfall",
    url: "https://planetfall.io/docs",
  },
};

export function GET(_req: NextRequest) {
  return NextResponse.json(document);
}
