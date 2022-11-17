import Image from "next/image";
import React from "react";
import { Feature, FeatureProps } from "./feature";

import { ApiSnippet } from "./features/api-snippet";

const features: FeatureProps[] = [
	{
		hash: "insights",
		title: "Gain Insights into the Performance of your API",
		description:
			"Synthetic monitoring for your APIs. Monitor the latency of your APIs from around the planet.",
		image: <div>Hello</div>,
		bullets: [
			{
				title: "22 Regions",
				description:
					"Check your API from around the globe. More regions coming soon.",
			},
			{
				title: "Custom timeouts",
				description:
					"Consider requests failed if your API does not respond in time",
			},
			{
				title: "Detect Problems early",
				description:
					"Define thresholds to get notified early in case your API performance degrades",
			},
		],
	},
	{
		hash: "statuspage",
		title: "Public Statuspage",
		description:
			"Group your APIs together and share their performance publicly with your customers",
		image: (
			<Image
				src="/img/landing/statuspage.png"
				width={1920}
				height={1080}
				alt="Feature screenshot"
			/>
		),
		bullets: [
			{
				title: "Integrated dashboard",
				description: "Free subdomain on planetfall.io",
			},
			{
				title: "1 Click Setup",
				description: "Select your APIs and a subdomain and you're done",
			},
		],
	},
	{
		hash: "alerts",
		title: "Alerts",
		description:
			"Receive realtime alerts when your API goes down or experiences degraded performance",
		image: <div>Hello</div>,

		bullets: [
			{ title: "Webhook", description: "" },
			{ title: "Email", description: "" },
			{ title: "Slack", description: "" },
		],
	},
	{
		hash: "api",
		title: "API",
		description:
			"Manage all your endpoints and pages via REST API or create your own integration",
		image: <ApiSnippet />,

		bullets: [
			{
				title: "Integrate",
				description:
					"Use our API to integrate Planetfall into your monitoring stack",
			},
			{
				title: "CI-CD",
				description:
					"Use preview branches and add monitoring within your CI pipeline",
			},
		],
	},
];

export function Features(): JSX.Element {
	return (
		<section id="features">
			<ul className="relative py-16 space-y-8 sm:py-24 lg:py-32 md:space-y-16 lg:space-y-32">
				{features.map((f, i) => (
					<Feature key={f.title} feature={f} i={i} />
				))}
			</ul>
		</section>
	);
}
