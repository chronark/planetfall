import type { AppProps } from "next/app";
import "tailwindcss/tailwind.css";
import { trpc } from "lib/hooks/trpc";
import PlausibleProvider from "next-plausible";
import "styles/ant.css";
import { AuthProvider } from "../components/auth";
import { ConfigProvider } from "antd";
import { useRouter } from "next/router";

function MyApp(
  { Component, pageProps: { auth, ...pageProps } }: AppProps<{ auth: any }>,
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
  ];
  return (
    <PlausibleProvider domain="planetfall.io">
      <ConfigProvider>
        <AuthProvider {...auth}>

          <Component {...pageProps} />
        </AuthProvider>
      </ConfigProvider>
    </PlausibleProvider>
  );
}

export default trpc.withTRPC(MyApp);
