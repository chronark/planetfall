import Image from "next/image";
import React from "react";
import { Feature, FeatureProps } from "./feature";

import { ApiSnippet } from "./features/api-snippet";

const features: FeatureProps[] = [
	{
		hash: "insights",
		title: "Gain Insights into the Performance of your API",
		description:
			"Synthetic monitoring for your APIs. Check the latency of your APIs from around the planet.",

		bullets: [
			{
				title: "22 Regions",
				description:
					"Planetfall can check your API from 22 regions across the globe",
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
		hash: "alerts",
		title: "Alerts",
		description:
			"Receive realtime alerts when your API goes down or experiences degraded performance",

		bullets: [{ title: "Webhooks, Email or Slack", description: "" }],
	},
	{
		hash: "statuspage",
		title: "Public Statuspage",
		description:
			"Create custom status pages for your APIs to share with your customers.",

		bullets: [
			{
				title: "Integrated Status Page",
				description:
					"Simply add a free subdomain on planetfall.io to host your status page",
			},
			{
				title: "1 Click Setup",
				description: "Select your APIs and a subdomain and you're done",
			},
		],
	},
	{
		hash: "api",
		title: "API",
		description:
			"The Planetfall REST API gives you full control over all resources to build anything.",
		image: <ApiSnippet />,

		bullets: [
			{
				title: "Checks",
				description: "Run checks programmatically",
			},
			{
				title: "CI/CD",
				description:
					"Integrate Planetfall into your release pipeline to ensure you never ship slow APIs again",
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
