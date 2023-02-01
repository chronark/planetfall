import { db } from "@planetfall/db";
import { asyncComponent } from "lib/api";
import React from "react";
import { Feature, FeatureProps } from "./feature";

import { ApiSnippet } from "./features/api-snippet";

export const Features = asyncComponent(async () => {
	const regions = await db.region.count();
	const features: FeatureProps[] = [
		{
			hash: "insights",
			title: "Gain Insights into the Performance of your API",
			description:
				"Synthetic monitoring for your APIs. Check the latency of your APIs from around the planet.",

			bullets: [
				{
					title: `${regions} Regions`,
					description:
						"See the true speed of your API from anywhere on the globe",
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
					title: "Public Status Page",
					description: "Share your monitoring results with your customers",
				},
				{
					title: "Free custom domain",
					description: "Bring your own domain.",
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
	return (
		<section id="features">
			<ul className="relative py-16 space-y-8 sm:py-24 lg:py-32 md:space-y-16 lg:space-y-32">
				{features.map((f, i) => (
					<Feature key={f.title} feature={f} i={i} />
				))}
			</ul>
		</section>
	);
});
