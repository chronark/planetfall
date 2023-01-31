"use client";

import classNames from "classnames";
import * as HoverCard from "@radix-ui/react-hover-card";
import { useState } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { Stats } from "@/components/stats";
import { Heading } from "@/components/heading";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
	AccordionItem,
	Accordion,
	AccordionContent,
	AccordionTrigger,
} from "@/components/accordion";


function format(n:number): string {
	return Intl.NumberFormat(undefined, {notation: "compact"}).format(Math.round(n));
}

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => {
	return (
		<div className="flex items-center space-x-1 text-xs md:text-sm text-zinc-700 whitespace-nowrap">
			<span className="flex-shrink-0 font-semibold">{label}:</span>
			<span>{ format(value)} ms</span>
		</div>
	);
};

export type Metric = {
	time: number;
	count: number;
	min: number;
	max: number;
	p50: number;
	p95: number;
	p99: number;
};

export const Row: React.FC<{
	endpoint: {
		id: string;
		name: string;
		url: string;
		degradedAfter?: number;
		timeout?: number;
		count: number;
		min: number;
		max: number;
		p50: number;
		p95: number;
		p99: number;
		metrics: Metric[];

		regions: Record<string, Omit<Metric, "time"> & { series: Metric[] }>;
	};
}> = ({ endpoint }): JSX.Element => {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className="my-16 list-none duration-1000 border-t sm:border border-zinc-300 sm:shadow-ambient md:rounded">
			<div className="flex flex-col items-start justify-between gap-2 px-4 py-5 border-b lg:flex-row border-zinc-300 sm:px-6 md:items-center">
				<div className="lg:w-1/2">
					<span className="text-lg font-medium leading-6 text-zinc-900">
						{endpoint.name ?? endpoint.url}
					</span>
				</div>
				<div className="flex flex-wrap items-center justify-between gap-2 lg:w-1/2 sm:gap-4 xl:gap-6 md:flex-nowrap">
					<Stat
						label="min"
						value={endpoint.min}
					/>

					<Stat
						label="p50"
						value={endpoint.p50}
					/>
					<Stat
						label="p95"
						value={endpoint.p95}
					/>
					<Stat
						label="p99"
						value={endpoint.p99}
					/>
					<Stat
						label="max"
						value={endpoint.max}
					/>
				</div>
			</div>

			<div className="flex flex-col p-4 space-y-8">
				<div className="hidden lg:block">
					<Chart
						metrics={endpoint.metrics}
						withAvailability={true}
						nBuckets={72}
					/>
				</div>
				<div className="lg:hidden">
					<Chart
						metrics={endpoint.metrics}
						withAvailability={true}
						nBuckets={24}
					/>
				</div>
				<Accordion type="multiple">
					<AccordionItem value={endpoint.id}>
						<AccordionPrimitive.Header>
							<AccordionPrimitive.Trigger className="flex items-center justify-center w-full">
								<div className="w-full border-t border-zinc-500" />
								<div className="relative flex justify-center">
									<span className="px-2 text-zinc-500 hover:text-primary-500">
										{expanded ? (
											<MinusIcon className="w-6 h-6" />
										) : (
											<PlusIcon className="w-6 h-6" />
										)}
									</span>
								</div>
								<div className="w-full border-t border-zinc-500" />
							</AccordionPrimitive.Trigger>
						</AccordionPrimitive.Header>
						<AccordionContent>
							{Object.entries(endpoint.regions)

							.map(([region, metrics]) => {
								if (!region) return null;
								return (
									<li className="py-4 space-y-2">
										<div className="flex flex-col items-start justify-between lg:flex-row md:items-center">
											<div className="lg:w-1/2">
												<h4 className="text-lg text-bold text-zinc-600 whitespace-nowrap">
													{region}
												</h4>
											</div>
											<div className="flex flex-wrap items-center justify-between gap-2 lg:w-1/2 sm:gap-4 xl:gap-6 md:flex-nowrap">
												<Stat label="min" value={metrics.min} />

												<Stat label="p50" value={metrics.p50} />
												<Stat label="p95" value={metrics.p95} />
												<Stat label="p99" value={metrics.p99} />
												<Stat label="max" value={metrics.max} />
											</div>
										</div>
										<div className="hidden lg:block ">
											<Chart
												metrics={metrics.series}
												nBuckets={72}
												degradedAfter={endpoint.degradedAfter}
												timeout={endpoint.timeout}
											/>
										</div>
										<div className="lg:hidden">
											<Chart
												metrics={metrics.series}
												nBuckets={24}
												degradedAfter={endpoint.degradedAfter}
												timeout={endpoint.timeout}
											/>
										</div>
									</li>
								);
							})}
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</div>
	);
};

const Chart: React.FC<{
	height?: string;
	metrics: Metric[];
	withAvailability?: boolean;
	nBuckets: number;
	degradedAfter?: number;
	timeout?: number;
}> = ({
	metrics,
	height,
	withAvailability,
	degradedAfter,
	timeout,
}): JSX.Element => {
	const p99 = Math.max(...metrics.map((m) => m.p99));

	let t = new Date();
	t.setMinutes(0);
	t.setSeconds(0);
	t.setMilliseconds(0);

	const errors = 0; //endpoint.checks.filter((s) => s.error).length;
	const availability = 1; //1endpoint.checks.length > 0
	// ? 1 - (errors / endpoint.checks.length)
	// : 1;
	return (
		<div>
			{withAvailability ? (
				<div className="relative flex items-center mb-2">
					<div
						className={classNames("w-full border-t", {
							"border-green-500": availability >= 0.99,
							"border-orange-500": availability < 0.99 && availability >= 0.95,
							"border-rose-500": availability < 0.95,
						})}
					/>

					<div className="relative flex justify-center">
						<span
							className={classNames(" px-2 text-sm", {
								"text-green-500": availability >= 0.99,
								"text-orange-500": availability < 0.99 && availability >= 0.95,
								"text-rose-500": availability < 0.95,
							})}
						>
							{(availability * 100).toFixed(2)}%
						</span>
					</div>
					<div
						className={classNames("w-full border-t", {
							"border-green-500": availability >= 0.99,
							"border-orange-500": availability < 0.99 && availability >= 0.95,
							"border-rose-500": availability < 0.95,
						})}
					/>
				</div>
			) : null}
			<div className={`flex  ${height ?? "h-12"} items-end`}>
				{metrics
					.sort(
						(a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
					)
					.map((bucket, i) => {
						const start = new Date(bucket.time);
						const end = new Date(start.getTime() + 60 * 60 * 1000);

						const percentageHeight =
							bucket.time >= 0 ? Math.max(5, (bucket.p99 / p99) * 100) : 100;

						const bucketTimeout = timeout && bucket.max > timeout;
						const bucketDegraded = degradedAfter && bucket.max > degradedAfter;
						// ? p99 > endpoint.degradedAfter
						// : 0;
						const cn = [
							"flex-1 rounded-sm border border-white transition-all duration-150 px-px hover:scale-110 py-1 ",
						];

						if (bucket.time < 0) {
							cn.push("bg-gradient-to-t bg-zinc-400/20 hover:bg-zinc-400/50 ");
						} else if (bucketTimeout) {
							cn.push("bg-gradient-to-t bg-red-500  ");
						} else if (bucketDegraded) {
							cn.push("bg-gradient-to-t bg-yellow-400  ");
						} else {
							cn.push("bg-gradient-to-t bg-emerald-400");
						}

						return (
							<HoverCard.Root openDelay={50} closeDelay={40} key={i}>
								<HoverCard.Trigger
									key={i}
									className={cn.join(" ")}
									style={{
										height: `${percentageHeight}%`,
									}}
								/>
								<HoverCard.Portal>
									<HoverCard.Content>
										<>
											{bucket.time}
											{bucket.time >= 0 ? (
												<>
													<div className="max-w-xl px-4 py-5 overflow-hidden bg-white rounded-sm shadow sm:p-6">
														<dt className="text-sm font-medium truncate text-zinc-500">
															{start.toLocaleDateString()}
														</dt>
														<dt className="text-sm font-medium truncate text-zinc-500" />
														<dt className="text-sm font-medium truncate text-zinc-500">
															{/* {bucket.region} */}
														</dt>
														<div>
															<h3 className="text-lg font-medium leading-6 text-zinc-900">
																{start.toLocaleTimeString()} -{" "}
																{end.toLocaleTimeString()}
															</h3>
															<dl className="grid grid-cols-1 mt-5 md:grid-cols-3 ">
																{[
																	{ name: "p50", value: bucket.p50 },
																	{
																		name: "p95",
																		value: bucket.p95,
																	},
																	{ name: "p99", value: bucket.p99 },
																].map((item) => (
																	<Stats
																		key={item.name}
																		label={item.name}
																		value={format(item.value)}
																		suffix="ms"
																		// status={endpoint.degradedAfter
																		//     ? item.value >= endpoint.degradedAfter
																		//         ? "warn"
																		//         : "success"
																		//     : undefined}
																	/>
																))}
															</dl>
														</div>
													</div>
													<HoverCard.Arrow />
												</>
											) : null}
										</>
									</HoverCard.Content>
								</HoverCard.Portal>
							</HoverCard.Root>
						);
					})}
			</div>
		</div>
	);
};
