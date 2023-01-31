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
		<div className="min-h-screen bg-zinc-50">
			<DesktopNavbar teamSlug={props.params.teamSlug} />

			<main>{props.children}</main>
		</div>
	);
}
