import { getGreeting } from "./handler";

export const runtime = "edge";

export const GET = getGreeting.handler;
