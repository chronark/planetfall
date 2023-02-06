import React from "react";
import { Client as Tinybird } from "@planetfall/tinybird";
import Link from "next/link";
import { db } from "@planetfall/db";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/page/header";
import { UpgradeButton } from "./UpgradeButton";
import { address } from "@/lib/env";
import { BillingCard } from "./BillingCard";
import { TeamCard } from "./TeamCard";
import { Divider } from "@/components/divider";
import { getSession } from "@/lib/auth";
import { DeleteCard } from "./DeleteCard";

export const revalidate = 60; // 1 minute

export default async function SettingsPage(props: {
	params: { teamSlug: string };
}) {
	const { session } = await getSession();
	if (!session) {
		return redirect("/auth/sign-in");
	}

	const team = await db.team.findUnique({
		where: { slug: props.params.teamSlug },
		include: {
			members: {
				include: {
					user: true,
				},
			},
		},
	});
	if (!team) {
		return notFound();
	}
	const user = team.members.find((m) => m.userId === session.user.id);
	if (!user) {
		return notFound();
	}

	// const protocol = process.env.NEXT_PUBLIC_VERCEL_ENV ? "https" : "http";
	// const host = process.env.NEXT_PUBLIC_VERCEL_ENV
	//     ? "planetfall.io"
	//     : "localhost:3000";

	// async function handleCheckout(plan: "PRO" | "PERSONAL") {
	//     const { url } = await checkout.mutateAsync({
	//         teamId: team!.id,
	//         returnUrl: `${protocol}://${host}/${router.asPath}`,
	//         plan,
	//     });
	//     if (url) {
	//         router.push(url);
	//     }
	// }

	const now = new Date();
	const year = now.getUTCFullYear();
	const month = now.getUTCMonth() + 1;

	const usage = await new Tinybird().getUsage(team.id, {
		year,
		month,
	});
	const totalUsage = usage.reduce((total, curr) => total + curr.usage, 0);

	return (
		<div>
			<PageHeader
				sticky={true}
				title="Settings"
				// description=""
			/>
			<main className="container mx-auto">
				<BillingCard
					team={{
						id: team.id,
						isPersonal: team.isPersonal,
						plan: team.plan,
						maxMonthlyRequests: team.maxMonthlyRequests,
					}}
					usage={totalUsage}
					usagePercentage={(totalUsage / team.maxMonthlyRequests) * 100}
					year={year}
					month={month}
				/>
				<Divider />
				<TeamCard
					currentUser={{ userId: user.userId, role: user.role }}
					members={team.members.map((m) => ({
						user: { id: m.userId, name: m.user.name, image: m.user.image },
						role: m.role,
					}))}
				/>

				{user.role === "OWNER" ? (
					<>
						<Divider />
						<DeleteCard teamId={team.id} teamSlug={team.slug} />
					</>
				) : null}
			</main>
		</div>
	);
}
