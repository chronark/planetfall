import { createOpenApiNextHandler } from "trpc-openapi";

import { router } from "@/lib/trpc/router";
import { createContext } from "@/lib/trpc/context";

export default createOpenApiNextHandler({ router, createContext });
