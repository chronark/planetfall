import React from "react";
import { Client as Tinybird } from "@planetfall/tinybird";
import Link from "next/link";
import { db } from "@planetfall/db";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page/header";
import { UpgradeButton } from "./UpgradeButton";
import { address } from "lib/env/address";
import { BillingCard } from "./BillingCard";

export const revalidate = 60; // 1 minute

export default async function SettingsPage(props: {
	params: { teamSlug: string };
}) {
	const team = await db.team.findUnique({
		where: { slug: props.params.teamSlug },
	});
	if (!team) {
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
			</main>
		</div>
	);
}
