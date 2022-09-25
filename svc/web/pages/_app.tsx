import { ClerkProvider } from "@clerk/nextjs";
import type { AppProps } from "next/app";
import "tailwindcss/tailwind.css";
import { trpc } from "lib/hooks/trpc";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default trpc.withTRPC(MyApp);
