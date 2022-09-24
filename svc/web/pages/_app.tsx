import type { AppProps } from "next/app";
import { ClerkProvider, SignedIn, SignedOut, SignIn } from "@clerk/nextjs";
import "tailwindcss/tailwind.css";
import { withTRPC } from "@trpc/next";
import { Router } from "./api/v1/trpc/[trpc]";
import { useRouter } from "next/router";
import { httpBatchLink } from "@trpc/react";
import PlausibleProvider from 'next-plausible'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <PlausibleProvider domain="planetfall.io">

    <ClerkProvider>
      <SignedIn>
        <Component {...pageProps} />
      </SignedIn>
      <SignedOut>
        <div className="w-screen h-screen flex items-center justify-center">
          <SignIn />
        </div>
      </SignedOut>
    </ClerkProvider>
    </PlausibleProvider>
  );
}

export default withTRPC<Router>({
  config: ({ ctx }) => {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/v1/trpc`
      : "/api/v1/trpc";
    return {
      links: [
        httpBatchLink<Router>({ url }),
      ],
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: true,
})(MyApp);
