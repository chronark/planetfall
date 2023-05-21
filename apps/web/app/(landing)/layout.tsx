import { Footer } from "./footer";
import { Header } from "./header";
import { SupportBubble } from "@/components/support";
import { ClerkProvider } from "@clerk/nextjs/app-beta";

export const revalidate = 3600;

export default async function Landing({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <div className="flex flex-col min-h-screen overflow-hidden">
        <Header />

        <main className="relative">
          {children}
          <div className="fixed right-6 bottom-6">
            <SupportBubble />
          </div>
        </main>
        <Footer />
      </div>
    </ClerkProvider>
  );
}
