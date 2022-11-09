import { Header } from "./header";
import { Footer } from "./footer";

export default async function Landing({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-gradient-to-tr from-black to-[#060823]">
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
}
