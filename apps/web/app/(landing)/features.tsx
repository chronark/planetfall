import { withCache } from "@/lib/cache";
import { db } from "@planetfall/db";
import { Row } from "app/_statuspages/[slug]/chart";
import { getStats } from "app/_statuspages/[slug]/get-stats";
import { asyncComponent } from "lib/api";
import {
	BarChart,
	Eye,
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
import React, { cache } from "react";
import { Feature, Props } from "./feature";

export const Features = asyncComponent(async () => {
	const regions = await cache(() => db.region.findMany())();
	const stats = await cache(async () => {
		const endpoint = await db.endpoint.findUnique({
			where: {
				id:
					process.env.NODE_ENV === "production"
						? "ept_Mf5j3QP7me7DRByaDzbS4y"
						: "ept_Jk9p1kGTRdvb54PUfZSmZu",
			},
		});
		if (!endpoint) {
			return null;
		}
		const stats = await getStats(endpoint);

		return {
			id: endpoint.id,
			name: endpoint.name,
			url: endpoint.url,
			degradedAfter: endpoint.degradedAfter ?? undefined,
			timeout: endpoint.timeout ?? undefined,
			stats: Object.entries(stats).reduce(
				(acc, [regionId, value]) => {
					const regionName =
						regions.find((r) => r.id === regionId)?.name ?? regionId;
					acc[regionName] = value;
					return acc;
				},

				{} as any,
			),
		};
	})();

	const features: Props["feature"][] = [
		{
			hash: "insights",
			tag: "Monitoring and Reporting",
			title: "Gain Insights into the Performance of your API.",
			description:
				"Synthetic monitoring for your APIs. Check the latency of your APIs from around the planet.",
			image: "/img/landing/endpoint.png",

			bullets: [
				{
					icon: Globe,
					title: `${regions.length} Regions.`,
					description:
						"Monitor your API from anywhere in the world. From all AWS regions and Vercel edge locations. ",
				},
				{
					icon: Timer,
					title: "Custom timeouts.",
					description:
						"Set custom timeouts for your API. If your API takes longer than the timeout to respond, it will be marked as failed.",
				},
				{
					icon: Siren,
					title: "Detect Problems early.",
					description:
						"Define thresholds to get notified early in case your API performance degrades.",
				},
			],
		},

		{
			tag: "Stay in control",
			hash: "alerts",
			title: "Realtime Alerts",
			description:
				"Receive realtime alerts when your API goes down or your users experience degraded performance",

			bullets: [
				{
					icon: Settings2,
					title: "Fine grained response assertions.",
					description:
						"Define success and failure conditions for each API and get notified when they fail",
				},
				{
					icon: Zap,
					title: "Real-time Alerts.",
					description:
						"Receive real-time alerts for potential performance issues.",
				},
				{
					icon: Webhook,
					title: "Channels.",
					description:
						"Receive alerts via Email, Webhook, Slack, Discord or Opsgenie.",
				},
			],
		},
		{
			tag: "Show, don't tell",
			hash: "statuspage",
			title: "Public Statuspage",
			description:
				"Create custom status pages for your APIs to share with your customers.",

			image: stats ? <Row endpoint={stats} /> : undefined,
			bullets: [
				{
					icon: Layers,
					title: "Easy Creation.",
					description:
						"Create a status page in seconds with a few clicks.",
				},
				{
					icon: Share2,
					title: "Sharable.",
					description:
						"Share status pages with your customers to keep them informed and build trust.",
				},
				{
					icon: Link2,
					title: "Free custom domain.",
					description: "Bring your own domain for your status page.",
				},
				{
					icon: BarChart,
					title: "Historical Data.",
					description:
						"Show historical data on API performance to provide a complete picture.",
				},
				{
					icon: Globe,
					title: "Global Monitoring.",
					description: "Display availability and latency for every region.",
				},
				{
					icon: Eye,
					title: "Transparent Communication.",
					description:
						"Improve communication with customers and stakeholders by providing transparent information.",
				},
			],
		},
		// {
		// 	hash: "api",
		// 	title: "API",.
		// 	description:
		// 		"The Planetfall REST API gives you full control over all resources to build anything.",
		// 	image: <ApiSnippet />,

		// 	bullets: [
		// 		{
		// 			icon: CurlyBraces,
		// 			title: "Checks",.
		// 			description: "Run checks programmatically",
		// 		},
		// 		{
		// 			icon: GitBranch,
		// 			title: "CI/CD",.
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
