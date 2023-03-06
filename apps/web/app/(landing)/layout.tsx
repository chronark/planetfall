import { Header } from "./header";
import { Footer } from "./footer";
import { auth } from "@clerk/nextjs/app-beta";

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function Landing({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Header />

      <main>{children}</main>
      <Footer />
    </div>
  );
}
