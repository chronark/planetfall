import { getSession } from "lib/auth";
import { redirect } from "next/navigation";
import { DesktopNavbar } from "../navbar-desktop";
import { SignIn } from "@/components/auth/sign-in";

export default async function AppLayout(props: {
	children: React.ReactNode;
	params: { teamSlug: string };
}) {
	const session = await getSession();
	if (!session) {
		return <SignIn/>;
	}

	console.log(__filename, { session });
	return (
		<div className="bg-white min-h-screen">
			<DesktopNavbar teamSlug={props.params.teamSlug} />

			<main>{props.children}</main>
		</div>
	);
}
