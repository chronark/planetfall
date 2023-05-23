import { NextApiRequest, NextApiResponse } from "next";

import { generateOpenApiDocument } from "trpc-openapi";

import { router } from "@/lib/trpc/router";

const openApiDocument = generateOpenApiDocument(router, {
  title: "Planetfall API",
  description: "Planetfall API",
  version: "1.0.0",
  baseUrl: "https://api.planetfall.io",
  docsUrl: "https://planetfall.io/docs",
  tags: ["endpoints"],
});

// Respond with our OpenAPI schema
const handler = (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).send(openApiDocument);
};

export default handler;
