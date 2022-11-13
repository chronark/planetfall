import { auth } from "@clerk/nextjs/app-beta";
import { redirect } from "next/navigation";
import { DesktopNavbar } from "../navbar-desktop";

export default async function AppLayout(props: {
	children: React.ReactNode;
	params: { teamSlug: string };
}) {
	const { sessionId } = auth();
	if (!sessionId) {
		redirect("/auth/sign-in");
		return;
	}
	return (
		<div className="bg-white min-h-screen">
			<DesktopNavbar teamSlug={props.params.teamSlug} />

			<main>{props.children}</main>
		</div>
	);
}
