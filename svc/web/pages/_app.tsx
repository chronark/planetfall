import type { AppProps } from "next/app";
import "tailwindcss/tailwind.css";
import { trpc } from "lib/hooks/trpc";
import PlausibleProvider from "next-plausible";
import {
  ClerkProvider,
  RedirectToSignIn,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { useRouter } from "next/router";
import type { Router } from "../server/router";
import "styles/ant.css";
import { ConfigProvider } from "antd";

function MyApp({ Component, pageProps }: AppProps) {
  const publicPages = [
    "/",
    "/pricing",
    "/auth/sign-in",
    "/auth/sign-up",
  ];
  const router = useRouter();
  ConfigProvider.config({
    theme: {
      primaryColor: "#0f172a", // tailwind-slate-900
    },
  });

  return (
    <PlausibleProvider domain="planetfall.io">
      <ConfigProvider>
        <ClerkProvider {...pageProps}>
          {publicPages.includes(router.pathname)
            ? <Component {...pageProps} />
            : (
              <>
                <SignedIn>
                  <Component {...pageProps} />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn redirectUrl="/home" />
                </SignedOut>
              </>
            )}
        </ClerkProvider>
      </ConfigProvider>
    </PlausibleProvider>
  );
}

export default trpc.withTRPC(MyApp);
