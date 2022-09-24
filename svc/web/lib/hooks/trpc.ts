import type { Router } from "../../pages/api/v1/trpc/[trpc]";
// pages/index.tsx
import { createTRPCReact } from "@trpc/react";

export const trpc = createTRPCReact<Router>();
