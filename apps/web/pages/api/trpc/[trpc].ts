import * as trpcNext from "@trpc/server/adapters/next";
import { router } from "lib/server/routers";
import { createContext } from "lib/server/context";
export default trpcNext.createNextApiHandler({
	router,
	createContext,
});
