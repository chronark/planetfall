import classNames from "classnames";
import Image from "next/image";
import React from "react";

import { ApiSnippet } from "./features/api-snippet";
type Feature = {
	hash: string;
	title: string;
	image: React.ReactNode;
	description: string;
	bullets: { title: string; description: string }[];
};
const features: Feature[] = [
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
			//  {
			//   title: "High Frequency",
			//   description: "Run checks every second",
			// }
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
				title: "Free",
				description: "Free subdomain on planetfall.io",
			},
			{
				title: "1 Click Setup",
				description: "Select your APIs and a subdomain and you're done",
			},
			{
				title: "Custom Domains",
				description: "Easy integration to use your own domain",
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
			"Manage all your endpoints and pages via REST API or create your own integration with our API",
		image: <ApiSnippet />,

		bullets: [
			{ title: "API", description: "Integrate Planetfall into your dashboard" },
			{
				title: "CI-CD",
				description:
					"Use preview branches and add monitoring within your CI pipeline",
			},
			{
				title: "Integrate",
				description:
					"Use our API to integrate Planetfall into your monitoring stack",
			},
		],
	},
];

const Feature: React.FC<{ feature: Feature; i: number }> = ({ feature, i }) => {
	return (
		<div className="container mx-auto text-center lg:px-8" id={feature.hash}>
			{/* <h2 className="text-lg font-semibold text-zinc-600"></h2> */}
			<div className="w-full h-6 max-w-md mx-auto drop-shadow-radiant" />

			<h3 className="py-2 mt-2 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-t from-zinc-100/80 to-white md:text-6xl">
				{feature.title}
			</h3>
			<p className="mx-auto mt-4 text-lg md:mt-8 lg:mt-16 max-w-prose text-zinc-200">
				{feature.description}
			</p>
			<div
				className={classNames(
					"flex items-center justify-center md:mt-8 lg:mt-16",
					{
						"flex-row-reverse": i % 2 === 1,
					},
				)}
			>
				<div className="z-10 w-3/5 mx-auto border rounded drop-shadow-feature border-zinc-300/20">
					{feature.image}
				</div>

				<div className="grid w-2/5 grid-cols-1 gap-4 lg:gap-8">
					{feature.bullets.map((b) => (
						<div
							key={b.title}
							className={classNames(
								" from-zinc-600/50 to-transparent drop-shadow-feature",
								{
									"bg-gradient-to-r": i % 2 === 0,
									"bg-gradient-to-l": i % 2 === 1,
								},
							)}
						>
							<div
								className={classNames(
									"absolute w-full h-px -top-px from-zinc-400/0 via-zinc-400/70  to-zinc-400/0",
									{
										"bg-gradient-to-r right-20": i % 2 === 0,
										"bg-gradient-to-l left-20": i % 2 === 1,
									},
								)}
							/>
							<div
								className={classNames(
									"absolute w-full h-px -bottom-px from-zinc-400/0 via-zinc-400/70 to-zinc-400/0",
									{
										"bg-gradient-to-r right-20": i % 2 === 0,
										"bg-gradient-to-l left-20": i % 2 === 1,
									},
								)}
							/>

							<div
								className={classNames(
									"p-4 from-zinc-300/20  to-transparent '",
									{
										"bg-gradient-feature-tr text-left": i % 2 === 0,
										"bg-gradient-feature-tl text-right": i % 2 === 1,
									},
								)}
							>
								<dt className=" text-zinc-100">{b.title}</dt>
								<dd className="mt-2 text-sm text-zinc-300">{b.description}</dd>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export function Features(): JSX.Element {
	return (
		<section id="features">
			<div className="relative py-16 space-y-8 sm:py-24 lg:py-32 md:space-y-16 lg:space-y-32">
				{features.map((f, i) => (
					<Feature key={f.title} feature={f} i={i} />
				))}
			</div>
		</section>
	);
}
