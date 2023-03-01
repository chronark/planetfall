import { Button } from "@/components/button";
import { db } from "@planetfall/db";
import { getSession } from "lib/auth";
import Link from "next/link";
import { Breadcrumbs } from "../breadcrumbs";
import { DesktopNavbar } from "../navbar-desktop";
import { NavLink } from "../navlink";
import { UserButton } from "../user-button";

const navigation = [
	{
		name: "Dashboard",
		href: "/home",
	},
];

export default async function PlayLayout(props: {
	children: React.ReactNode;
}) {
	const { session } = await getSession();

	const user = session
		? await db.user.findUnique({ where: { id: session.user.id } })
		: null;

	return (
		<div className="min-h-screen pb-8 bg-zinc-50 lg:pb-16">
			<nav className="bg-white border-b border-zinc-300">
				<div className="container px-4 pt-2 mx-auto sm:px-0">
					<div className="flex items-center justify-between">
						<Breadcrumbs withWordMark={true} prefix={["play"]} />
						{user ? (
							<UserButton
								user={{
									email: user.email,
									name: user.name,
									image: user.image,
								}}
							/>
						) : (
							<Link href="/auth/sign-in?to=/play">
								<Button variant="link">Sign In</Button>
							</Link>
						)}
					</div>
					<div className="mt-2 lg:mt-4">
						{navigation.map((item) => (
							<NavLink key={item.name} href={item.href} label={item.name} />
						))}
					</div>
				</div>
			</nav>

			<main className="px-4 lg:px-0">{props.children}</main>
		</div>
	);
}
