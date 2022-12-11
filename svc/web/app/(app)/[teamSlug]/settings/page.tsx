import React from "react";
import { Client as Tinybird } from "@planetfall/tinybird";
import Link from "next/link";
import { db } from "@planetfall/db";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page/header";
import { UpgradeButton } from "./UpgradeButton";
import { address } from "lib/env/address";
import { BillingCard } from "./BillingCard";
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

	const monthStart = new Date();
	monthStart.setDate(1);
	monthStart.setHours(0, 0, 0, 0);
	const monthEnd = new Date();
	monthEnd.setMonth(monthEnd.getMonth() + 1);
	monthEnd.setDate(0);
	monthEnd.setHours(0, 0, 0, 0);

	const billingStart =
		team.stripeCurrentBillingPeriodStart?.getTime() ?? monthStart.getTime();
	const billingEnd =
		team.stripeCurrentBillingPeriodEnd?.getTime() ?? monthEnd.getTime();

	const usage = await new Tinybird().getUsage(team.id, [
		billingStart,
		billingEnd,
	]);

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
					usage={usage}
					usagePercentage={(usage / team.maxMonthlyRequests) * 100}
					billingStart={billingStart}
					billingEnd={billingEnd}
				/>
			</main>
		</div>
	);
}
