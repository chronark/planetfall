import { ClerkProvider } from "@clerk/nextjs/app-beta";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
