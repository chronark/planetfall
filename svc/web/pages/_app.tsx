import type { AppProps } from "next/app";
import "tailwindcss/tailwind.css";
import { trpc } from "lib/hooks/trpc";
import PlausibleProvider from "next-plausible";
import "styles/ant.css";
import "public/fonts/css/pangea.css";
import "@tremor/react/dist/esm/tremor.css";
// import "nextra-theme-docs/style.css"

import {
  AuthProvider,
  RedirectToSignIn,
  Session,
  SignedIn,
  SignedOut,
} from "../components/auth";
import { ConfigProvider } from "antd";
import { useRouter } from "next/router";

function MyApp(
  { Component, pageProps }: AppProps,
) {
  ConfigProvider.config({
    theme: {
      primaryColor: "#0f172a", // tailwind-slate-900
    },
  });
  const router = useRouter();
  const publicPages = [
    "/",
    "/pricing",
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/sign-out",
    "/play",
    "/_statuspages/[slug]",
  ];
  const isPublicPage = router.pathname.startsWith("/docs") ||
    publicPages.some((r) => new RegExp(r).test(router.pathname));

  return (
    <PlausibleProvider domain="planetfall.io">
      <ConfigProvider>
        <AuthProvider>
          {isPublicPage ? <Component {...pageProps} /> : (
            <>
              <SignedIn>
                <Component {...pageProps} />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          )}
        </AuthProvider>
      </ConfigProvider>
    </PlausibleProvider>
  );
}

export default trpc.withTRPC(MyApp);
