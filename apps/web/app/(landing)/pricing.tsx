import React, { Fragment, PropsWithChildren } from "react";
import Link from "next/link";
import { DEFAULT_QUOTA } from "../../plans";
import ms from "ms";
import classNames from "classnames";
import { Check, Minus } from "lucide-react";
import { Section } from "./section";

type Tier = "Free" | "Pro" | "Enterprise";

type Tag = "New" | "Planned" | "Beta" | "In Development";

const tiers: {
	name: Tier;
	href: string;
	monthlyPrice:
		| {
				requests: number;
				price: number;
		  }
		| string;
	description: string;
	cta: string;
}[] = [
	{
		name: "Free",
		href: "/auth/sign-in",
		monthlyPrice: "$0",
		description: "No credit card required",
		cta: "Start for free",
	},
	{
		name: "Pro",
		href: "/auth/sign-in",
		monthlyPrice: {
			requests: 10000,
			price: 1,
		},
		description: "Pay as you go",
		cta: "Start for free",
	},

	{
		name: "Enterprise",
		href: "mailto:support@planetfall.io",
		monthlyPrice: "Contact us",
		description: "For large-scale APIs",
		cta: "Contact us",
	},
];
const sections: {
	name: string;
	features: {
		name: string;
		tiers: Record<Tier, string | boolean>;
		tag?: Tag;
	}[];
}[] = [
	{
		name: "Features",
		features: [
			{
				name: "Included requests",
				tiers: {
					Free: `${DEFAULT_QUOTA.FREE.includedRequests / 1000}k`,
					Pro: `${DEFAULT_QUOTA.PRO.includedRequests / 1000}k`,
					Enterprise: "Custom",
				},
			},
			{
				name: "Additional requests",
				tiers: {
					Free: false,
					Pro: "$1 / 10,000",
					Enterprise: "Custom",
				},
			},
			{
				name: "Teams",
				tiers: { Free: false, Pro: true, Enterprise: true },
			},
			{
				name: "Status Pages",
				tiers: {
					Free: DEFAULT_QUOTA.FREE.maxStatusPages.toString(),
					Pro: DEFAULT_QUOTA.PRO.maxStatusPages.toString(),
					Enterprise: "∞",
				},
				tag: "New",
			},
		],
	},
	{
		name: "Endpoints",
		features: [
			{
				name: "Number of endpoints",
				tiers: {
					Free: DEFAULT_QUOTA.FREE.maxEndpoints.toLocaleString(),
					Pro: DEFAULT_QUOTA.PRO.maxEndpoints.toLocaleString(),
					Enterprise: "∞",
				},
			},
			{
				name: "Minimum Interval",
				tiers: {
					Free: ms(DEFAULT_QUOTA.FREE.minInterval),
					Pro: ms(DEFAULT_QUOTA.PRO.minInterval),
					Enterprise: ms(DEFAULT_QUOTA.ENTERPRISE.minInterval),
				},
			},
			{
				name: "Timeout",
				tiers: {
					Free: ms(DEFAULT_QUOTA.FREE.maxTimeout),
					Pro: ms(DEFAULT_QUOTA.PRO.maxTimeout),
					Enterprise: "Custom",
				},
			},
		],
	},
	{
		name: "Storage",
		features: [
			{
				name: "Data Retention",
				tiers: {
					Free: ms(DEFAULT_QUOTA.FREE.retention, { long: true }),
					Pro: ms(DEFAULT_QUOTA.PRO.retention, { long: true }),
					Enterprise: ms(DEFAULT_QUOTA.ENTERPRISE.retention, { long: true }),
				},
			},
			{
				name: "Audit Logs",
				tiers: {
					Free: false,

					Pro: false,
					Enterprise: true,
				},
				tag: "Planned",
			},
		],
	},
	{
		name: "Alerts",
		features: [
			{
				name: "Email",
				tiers: {
					Free: true,

					Pro: true,
					Enterprise: true,
				},
				tag: "New",
			},
			{
				name: "Webhooks",
				tiers: {
					Free: true,
					Pro: true,
					Enterprise: true,
				},
				tag: "Planned",
			},
			{
				name: "Slack",
				tiers: {
					Free: false,
					Pro: true,
					Enterprise: true,
				},
				tag: "Planned",
			},
			{
				name: "Opsgenie",
				tiers: {
					Free: false,
					Pro: true,
					Enterprise: true,
				},
				tag: "Planned",
			},
		],
	},
];

const Button: React.FC<PropsWithChildren<{ href: string }>> = ({
	children,
	href,
}) => {
	return (
		<Link
			href={href}
			className="block w-full py-2 text-sm font-semibold text-center duration-150 border rounded border-zinc-900 bg-zinc-900 text-zinc-50 hover:bg-white hover:text-zinc-900 hover:drop-shadow-cta focus:bg-zinc-900 focus:text-zinc-50 focus:drop-shadow-none "
		>
			{children}
		</Link>
	);
};

export const Pricing: React.FC = (): JSX.Element => {
	return (
		<Section
			id="pricing"
			title="Pricing"
			description="Start for free, upgrade when you need more."
		>
			{/* xs to lg */}
			<div className="max-w-2xl px-4 mx-auto space-y-16 lg:hidden">
				{tiers.map((tier, tierIdx) => (
					<section key={tier.name}>
						<div className="px-4 mb-8">
							<h2 className="text-lg font-medium leading-6 text-zinc-900">
								{tier.name}
							</h2>
							<p className="mt-4">
								{typeof tier.monthlyPrice === "string" ? (
									<span className="text-4xl font-bold tracking-tight text-zinc-900">
										{tier.monthlyPrice}
									</span>
								) : (
									<>
										<span className="text-4xl font-bold tracking-tight text-zinc-900">
											${tier.monthlyPrice.price}
										</span>
										<span className="text-base font-medium text-zinc-900">
											/{tier.monthlyPrice.requests.toLocaleString()} Requests
										</span>
									</>
								)}
							</p>
							<p className="mt-4 text-sm text-zinc-500">{tier.description}</p>
							<Button href={tier.href}>{tier.cta}</Button>
						</div>

						{sections.map((section) => (
							<table key={section.name} className="w-full">
								<caption className="px-4 py-3 text-sm font-medium text-left rounded bg-zinc-900 text-zinc-50">
									{section.name}
								</caption>
								<thead>
									<tr>
										<th className="sr-only" scope="col">
											Feature
										</th>
										<th className="sr-only" scope="col">
											Included
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-zinc-500">
									{section.features.map((feature) => (
										<tr key={feature.name}>
											<th
												className="flex items-center gap-4 px-6 py-5 text-sm font-normal text-left text-zinc-600"
												scope="row"
											>
												<span>{feature.name}</span>
												{feature.tag ? (
													<span
														className={classNames(
															"px-1 text-xs border rounded ",
															{
																"bg-primary-200/50 border-primary-600 text-primary-800":
																	feature.tag === "New",
																"border-orange-500 text-orange-500":
																	feature.tag === "Beta",
																"border-zinc-400 text-zinc-400":
																	feature.tag === "In Development",
																"border-zinc-500 bg-zinc-100/50 text-zinc-500":
																	feature.tag === "Planned",
															},
														)}
													>
														{feature.tag}
													</span>
												) : null}
											</th>
											<td className="py-5 pr-4">
												{typeof feature.tiers[tier.name] === "string" ? (
													<span className="block text-sm text-right text-zinc-600">
														{feature.tiers[tier.name]}
													</span>
												) : (
													<>
														{feature.tiers[tier.name] === true ? (
															<Check
																className="w-5 h-5 ml-auto text-zinc-700"
																aria-hidden="true"
															/>
														) : (
															<Minus
																className="w-5 h-5 ml-auto text-zinc-600"
																aria-hidden="true"
															/>
														)}

														<span className="sr-only">
															{feature.tiers[tier.name] === true ? "Yes" : "No"}
														</span>
													</>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						))}

						<div
							className={classNames(
								tierIdx < tiers.length - 1 ? "py-5 border-b" : "pt-5",
								"border-t border-zinc-300",
							)}
						>
							<Button href={tier.href}>{tier.cta}</Button>
						</div>
					</section>
				))}
			</div>

			{/* lg+ */}
			<div className="container hidden mx-auto lg:block">
				<table className="w-full h-px table-fixed">
					<caption className="sr-only">Pricing plan comparison</caption>
					<thead>
						<tr>
							<th
								className="w-1/4 px-6 pb-4 text-sm font-medium text-left text-zinc-900"
								scope="col"
							>
								<span className="sr-only">Feature by</span>
								<span>Plans</span>
							</th>
							{tiers.map((tier) => (
								<th
									key={tier.name}
									className="px-6 pb-4 text-lg font-medium leading-6 text-left lg:w-1/4 text-zinc-900"
									scope="col"
								>
									{tier.name}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="border-t divide-y divide-zinc-200 border-zinc-200">
						<tr>
							<th
								className="px-6 py-8 text-sm font-medium text-left align-top text-zinc-900"
								scope="row"
							>
								Pricing
							</th>
							{tiers.map((tier) => (
								<td key={tier.name} className="h-full px-6 py-8 align-top ">
									<div className="relative table w-full h-full">
										<p>
											{typeof tier.monthlyPrice === "string" ? (
												<span className="text-4xl font-bold tracking-tight text-zinc-900">
													{tier.monthlyPrice}
												</span>
											) : (
												<>
													<span className="text-4xl font-bold tracking-tight text-zinc-900">
														${tier.monthlyPrice.price}
													</span>
													<span className="text-base font-medium text-zinc-900">
														/{tier.monthlyPrice.requests.toLocaleString()}{" "}
														Requests
													</span>
												</>
											)}
										</p>
										<p className="mt-4 mb-16 text-sm text-zinc-600">
											{tier.description}
										</p>
										<Button href={tier.href}>{tier.cta}</Button>
									</div>
								</td>
							))}
						</tr>
						{sections.map((section) => (
							<Fragment key={section.name}>
								<tr>
									<th
										className="py-3 pl-6 text-sm font-medium text-left bg-zinc-100 text-zinc-900"
										colSpan={5}
										scope="colgroup"
									>
										{section.name}
									</th>
								</tr>
								{section.features.map((feature) => (
									<tr key={feature.name}>
										<th
											className="flex items-center gap-4 px-6 py-5 text-sm font-normal text-left text-zinc-600"
											scope="row"
										>
											<span>{feature.name}</span>
											{feature.tag ? (
												<span
													className={classNames(
														"px-1 text-xs border rounded ",
														{
															"bg-primary-200/50 border-primary-400 text-primary-600":
																feature.tag === "New",
															"border-orange-500 text-orange-500":
																feature.tag === "Beta",
															"border-zinc-400 text-zinc-400":
																feature.tag === "In Development",
															"border-zinc-500 bg-zinc-200/50 text-zinc-500":
																feature.tag === "Planned",
														},
													)}
												>
													{feature.tag}
												</span>
											) : null}
										</th>
										{tiers.map((tier) => (
											<td key={tier.name} className="px-6 py-5 text-center ">
												{typeof feature.tiers[tier.name] === "string" ? (
													<span className="block text-sm text-zinc-700">
														{feature.tiers[tier.name]}
													</span>
												) : (
													<div className="flex justify-center">
														{feature.tiers[tier.name] === true ? (
															<Check
																className="w-5 h-5 text-zinc-700"
																aria-hidden="true"
															/>
														) : (
															<Minus
																className="w-5 h-5 text-zinc-600"
																aria-hidden="true"
															/>
														)}

														<span className="sr-only">
															{feature.tiers[tier.name] === true
																? "Included"
																: "Not included"}{" "}
															in {tier.name}
														</span>
													</div>
												)}
											</td>
										))}
									</tr>
								))}
							</Fragment>
						))}
					</tbody>
					<tfoot>
						<tr>
							<th className="sr-only" scope="row">
								Choose your plan
							</th>
							{tiers.map((tier) => (
								<td key={tier.name} className="px-6 pt-5">
									<Button href={tier.href}>{tier.cta}</Button>
								</td>
							))}
						</tr>
					</tfoot>
				</table>
			</div>
		</Section>
	);
};
