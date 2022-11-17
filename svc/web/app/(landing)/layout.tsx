import { Header } from "./header";
import { Footer } from "./footer";

export default async function Landing({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col min-h-screen overflow-hidden bg-black bg-gradient-to-tr from-zinc-900/90 to-zinc-700/20">
			<Header />

			<main>{children}</main>
			<Footer />
		</div>
	);
}
