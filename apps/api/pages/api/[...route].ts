import { app } from "@/router/router";
import { handle } from "hono/vercel";

export const config = {
  runtime: "edge",
};

export default handle(app);
