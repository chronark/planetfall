import { asyncComponent } from "lib/api/component";
import { UserButton } from "./user-button";
import { notFound, redirect } from "next/navigation";
import { NavLink } from "./navlink";
import { TeamSwitcher } from "./team-switcher";
import { Breadcrumbs } from "./breadcrumbs";

import { db } from "@planetfall/db";
import { getSession } from "lib/auth";

export type NavbarProps = {
	teamSlug: string;
};

export const DesktopNavbar = asyncComponent(async (props: NavbarProps) => {
	const { session } = await getSession();

	if (!session) {
		return redirect("/auth/sign-in");
	}

	const navigation: { name: string; href: string }[] = [
		{ name: "Endpoints", href: `/${props.teamSlug}/endpoints` },
		{ name: "Pages", href: `/${props.teamSlug}/pages` },
		{ name: "Settings", href: `/${props.teamSlug}/settings` },
	];
	const user = await db.user.findUnique({ where: { id: session.user.id } });
	if (!user) {
		console.warn(__filename, "User not found");
		notFound();
	}

	const teams = await db.team.findMany({
		where: {
			members: { some: { userId: session.user.id } },
		},
	});

	const currentTeam = teams.find((team) => team.slug === props.teamSlug);
	if (!currentTeam) {
		notFound();
	}

	return (
		<nav className="bg-white border-b border-zinc-300">
			<div className="container pt-2 mx-auto">
				<div className="flex items-center justify-between">
					<Breadcrumbs
						teamSlug={props.teamSlug}
						teamSwitcher={
							<TeamSwitcher
								teams={teams.map((t) => ({
									isPersonal: t.isPersonal,
									id: t.id,
									name: t.name,
									slug: t.slug,
								}))}
								currentTeamId={currentTeam.id}
							/>
						}
					/>
					<UserButton
						user={{
							email: user.email,
							name: user.name,
							image: user.image,
						}}
					/>
				</div>
				<div className="mt-2 lg:mt-4">
					{navigation.map((item) => (
						<NavLink key={item.name} href={item.href} label={item.name} />
					))}
				</div>
			</div>
		</nav>
	);
});
