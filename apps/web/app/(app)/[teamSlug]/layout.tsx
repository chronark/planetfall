import { getSession } from "lib/auth";
import { redirect } from "next/navigation";
import { DesktopNavbar } from "../navbar-desktop";

export default async function AppLayout(props: {
	children: React.ReactNode;
	params: { teamSlug: string };
}) {
	const session = await getSession();
	if (!session) {
		return redirect("/auth/sign-in");
	}

	return (
		<div className="min-h-screen pb-8 bg-zinc-50 lg:pb-16">
			<DesktopNavbar teamSlug={props.params.teamSlug} />

			<main className="px-4 lg:px-0">{props.children}</main>
		</div>
	);
}
