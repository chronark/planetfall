import type { AppProps } from "next/app";
import "tailwindcss/tailwind.css";
import { trpc } from "lib/hooks/trpc";
import PlausibleProvider from "next-plausible";
import "styles/ant.css";
import { SessionProvider, SessionProviderProps } from "next-auth/react";

import { ConfigProvider } from "antd";

function MyApp(
  { Component, pageProps: { session, ...pageProps } }: AppProps<
    { session: SessionProviderProps["session"] }
  >,
) {
  ConfigProvider.config({
    theme: {
      primaryColor: "#0f172a", // tailwind-slate-900
    },
  });

  return (
    <PlausibleProvider domain="planetfall.io">
      <ConfigProvider>
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </ConfigProvider>
    </PlausibleProvider>
  );
}

export default trpc.withTRPC(MyApp);
