import { db } from "@planetfall/db";
import { Row } from "app/_statuspages/[slug]/chart";
import { getStats } from "app/_statuspages/[slug]/get-stats";
import { asyncComponent } from "lib/api";
import {
	CurlyBraces,
	GitBranch,
	Globe,
	Layers,
	Link2,
	Settings2,
	Share2,
	Siren,
	Timer,
	Webhook,
	Zap,
} from "lucide-react";
import React from "react";
import { Feature, Props } from "./feature";

import { ApiSnippet } from "./features/api-snippet";

export const revalidate = 86400; // revalidate every day

export const Features = asyncComponent(async () => {
	const regions = await db.region.count({ where: { visible: true } });

	const endpoint = await db.endpoint.findUnique({
		where: {
			id:
				process.env.NODE_ENV === "production"
					? "ept_Mf5j3QP7me7DRByaDzbS4y"
					: "ept_Jk9p1kGTRdvb54PUfZSmZu",
		},
	});

	const stats = endpoint ? await getStats(endpoint, endpoint.timeout!) : null;
	const features: Props["feature"][] = [
		{
			hash: "insights",
			tag: "Understand",
			title: "Gain Insights into the Performance of your API",
			description:
				"Synthetic monitoring for your APIs. Check the latency of your APIs from around the planet.",

			bullets: [
				{
					icon: Globe,
					title: `${regions} Regions`,
					description:
						"Monitor your API from anywhere in the world. From all AWS regions and Vercel edge locations.",
				},
				{
					icon: Timer,
					title: "Custom timeouts",
					description:
						"Set custom timeouts for your API. If your API takes longer than the timeout to respond, it will be marked as failed.",
				},
				{
					icon: Siren,
					title: "Detect Problems early",
					description:
						"Define thresholds to get notified early in case your API performance degrades",
				},
			],
		},

		{
			tag: "Stay in control",
			hash: "alerts",
			title: "Alerts",
			description:
				"Receive realtime alerts when your API goes down or experiences degraded performance",

			bullets: [
				{
					icon: Settings2,
					title: "Fine grained response assertions",
					description:
						"Define success and failure conditions for each API and get notified when they fail",
				},
				{
					icon: Webhook,
					title: "Webhooks, Email or Slack",
					description: "",
				},
				{
					icon: Zap,
					title: "Instant notifications",
					description:
						"Get notified as soon as your API performance degrades to fix it before your customers notice.",
				},
			],
		},
		{
			tag: "Share with your customers",
			hash: "statuspage",
			title: "Statuspage",
			description:
				"Create custom status pages for your APIs to share with your customers.",

			image: stats ? <Row regions={[]} endpoint={stats} /> : undefined,
			bullets: [
				{
					icon: Layers,
					title: "Status Page.",
					description:
						"One click deployment of public status pages for your API.",
				},
				{
					icon: Share2,
					title: "Share.",
					description:
						" status pages with your customers to keep them informed and build trust..",
				},
				{
					icon: Link2,
					title: "Free custom domain",
					description: "Bring your own domain.",
				},
			],
		},
		// {
		// 	hash: "api",
		// 	title: "API",
		// 	description:
		// 		"The Planetfall REST API gives you full control over all resources to build anything.",
		// 	image: <ApiSnippet />,

		// 	bullets: [
		// 		{
		// 			icon: CurlyBraces,
		// 			title: "Checks",
		// 			description: "Run checks programmatically",
		// 		},
		// 		{
		// 			icon: GitBranch,
		// 			title: "CI/CD",
		// 			description:
		// 				"Integrate Planetfall into your release pipeline to ensure you never ship slow APIs again",
		// 		},
		// 	],
		// },
	];
	return (
		<section id="features">
			<ul className="relative py-16 space-y-8 sm:py-24 lg:py-32 md:space-y-16 lg:space-y-32">
				{features.map((f, i) => (
					<Feature key={f.hash} feature={f} />
				))}
			</ul>
		</section>
	);
});
