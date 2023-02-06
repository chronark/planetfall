import { Header } from "./header";
import { Footer } from "./footer";
import { getSession } from "lib/auth";

export default async function Landing({
	children,
}: {
	children: React.ReactNode;
}) {
	const { session } = await getSession();

	return (
		<div className="flex flex-col min-h-screen overflow-hidden">
			<Header session={session} />

			<main>{children}</main>
			<Footer />
		</div>
	);
}
