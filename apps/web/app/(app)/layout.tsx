import { ClerkProvider } from "@clerk/nextjs/app-beta";
import { ReactQueryProvider } from "./react-query-provider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </ClerkProvider>
  );
}
