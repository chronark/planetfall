import { ReactQueryProvider } from "./react-query-provider";
import { SentryIdentifyUser } from "./sentry";
import { ClerkProvider } from "@clerk/nextjs/app-beta";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ReactQueryProvider>{children}</ReactQueryProvider>
      <SentryIdentifyUser />
    </ClerkProvider>
  );
}
