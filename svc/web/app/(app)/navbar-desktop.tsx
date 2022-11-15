import { asyncComponent } from "lib/api/component";
import { UserButton } from "./user-button";
import { notFound, redirect } from "next/navigation";
import { NavLink } from "./navlink";
import { TeamSwitcher } from "./team-switcher";
import { Breadcrumbs } from "./breadcrumbs";

import { db } from "@planetfall/db";
import { getSession } from "lib/auth";

const userNavigation = [
	{ name: "Settings", href: "/settings" },
	{ name: "Sign out", href: "/auth/sign-out" },
];

export type NavbarProps = {
	teamSlug: string;
};

export const DesktopNavbar = asyncComponent(async (props: NavbarProps) => {
	const { session } = await getSession();

	if (!session) {
		redirect("/auth/sign-in");
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
		<nav className="border-b border-slate-300">
			<div className="container mx-auto pt-2">
				<div className="flex justify-between items-center">
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
				<div>
					{navigation.map((item) => (
						<NavLink key={item.name} href={item.href} label={item.name} />
					))}
				</div>
			</div>
		</nav>
	);
});
