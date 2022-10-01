import { httpLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { Router } from "server/router";

function getBaseUrl() {
  if (typeof window !== "undefined") { // browser should use relative path
    return "";
  }

  if (process.env.VERCEL_URL) { // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  }

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpc = createTRPCNext<Router>({
  config({ ctx }) {
    return {
      links: [
        httpLink({
          /**
           * If you want to use SSR, you need to use the server's full URL
           * @link https://trpc.io/docs/ssr
           */
          url: `${getBaseUrl()}/api/v1/trpc`,
        }),
      ],
      /**
       * @link https://react-query-v3.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: true,
});
// => { useQuery: ..., useMutation: ...}
