"use client";

import * as HoverCard from "@radix-ui/react-hover-card";
import { useState } from "react";
import { Stats } from "@/components/stats";
import { Heading } from "@/components/heading";
import { ChevronDown } from "lucide-react";
import { CardContent, CardHeader, Card } from "@/components/card";
import cn from "classnames";
import { Text } from "@/components/text";
function format(n: number): string {
	return Intl.NumberFormat(undefined).format(Math.round(n));
}

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => {
	return (
		<div className="flex items-center space-x-1 text-xs text-zinc-700 whitespace-nowrap">
			<span className="font-semibold">{label}:</span>
			<span className="">{format(value)} ms</span>
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
	errors: number;
};

export const Row: React.FC<{
	regions: { id: string; name: string }[];
	endpoint: {
		id: string;
		name: string;
		url: string;
		degradedAfter?: number;
		timeout: number;
		count: number;
		min: number;
		max: number;
		p50: number;
		p95: number;
		p99: number;
		metrics: Metric[];

		regions: Record<string, Omit<Metric, "time"> & { series: Metric[] }>;
	};
}> = ({ endpoint, regions }): JSX.Element => {
	const [expanded, setExpanded] = useState(false);

	const errors =
		endpoint.metrics.filter((m) => m.max >= endpoint.timeout).length +
		endpoint.metrics.filter((m) => m.errors > 0).length;
	const availability =
		endpoint.metrics.length > 0 ? 1 - errors / endpoint.metrics.length : 1;

	const current =
		endpoint.metrics.at(-1)!.max > endpoint.timeout
			? "Error"
			: endpoint.degradedAfter &&
			  endpoint.metrics.at(-1)!.max > endpoint.degradedAfter
			? "Degraded"
			: "Operational";

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between w-full">
					<div className="lg:w-1/2">
						<Heading h3>{endpoint.name}</Heading>
						<div className="flex justify-start mt-4">
							<div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
								<Stat label="min" value={endpoint.min} />
								<Stat label="p50" value={endpoint.p50} />
								<Stat label="p95" value={endpoint.p95} />
								<Stat label="p99" value={endpoint.p99} />
								<Stat label="max" value={endpoint.max} />
							</div>
						</div>
					</div>

					<div className="flex flex-col-reverse items-end gap-4 sm:items-center sm:flex-row">
						<Text size="sm" lineBreak={false}>
							{(availability * 100).toFixed(2)} % Availability
						</Text>

						<div className="flex items-center gap-2 px-3 py-1 border rounded-full border-zinc-300">
							<div
								className={cn("w-2.5 h-2.5 rounded-full", {
									"bg-green-500": current === "Operational",
									"bg-yellow-500": current === "Degraded",
									"bg-red-500": current === "Error",
								})}
							/>
							<span className="text-sm font-medium">{current}</span>
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col space-y-2">
					<Chart
						metrics={endpoint.metrics}
						nBuckets={72}
						degradedAfter={endpoint.degradedAfter}
						timeout={endpoint.timeout}
					/>
				</div>

				<div className="flex justify-end gap-4 py-2 mt-2 md:gap-8">
					<button
						className="flex items-center gap-1 text-sm duration-150 text-zinc-500 hover:text-zinc-800"
						onClick={() => setExpanded(!expanded)}
					>
						<span>Show details</span>{" "}
						<ChevronDown
							className={cn("w-4 h-4 transition-all duration-150", {
								"rotate-180": expanded,
							})}
						/>
					</button>
				</div>

				{expanded ? (
					<ul className="grid grid-cols-1 gap-4 py-8 lg:grid-cols-2">
						{Object.entries(endpoint.regions)

						.map(([regionId, metrics]) => (
							<li
								key={regionId}
								className="flex flex-col p-4 space-y-2 border rounded border-zinc-200"
							>
								<div className="flex flex-col items-start justify-between ">
									<h4 className="text-lg text-bold text-zinc-600 whitespace-nowrap">
										{regions.find((r) => r.id === regionId)?.name || regionId}
									</h4>
									<div className="flex flex-wrap items-center justify-between gap-2 lg:w-1/2 sm:gap-4 xl:gap-6 md:flex-nowrap">
										<Stat label="min" value={metrics.min} />
										<Stat label="p50" value={metrics.p50} />
										<Stat label="p95" value={metrics.p95} />
										<Stat label="p99" value={metrics.p99} />
										<Stat label="max" value={metrics.max} />
									</div>
								</div>
								<Chart
									metrics={metrics.series}
									nBuckets={72}
									degradedAfter={endpoint.degradedAfter}
									timeout={endpoint.timeout}
								/>
							</li>
						))}
					</ul>
				) : null}
			</CardContent>
		</Card>
	);
};

const Chart: React.FC<{
	height?: string;
	metrics: Metric[];
	nBuckets: number;
	degradedAfter?: number;
	timeout?: number;
}> = ({ metrics, nBuckets, height, degradedAfter, timeout }): JSX.Element => {
	metrics = metrics
		.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
		.slice(-nBuckets);
	const p99 = Math.max(...metrics.map((m) => m.p99));

	let t = new Date();
	t.setMinutes(0);
	t.setSeconds(0);
	t.setMilliseconds(0);

	return (
		<div>
			<div className={`flex bg-white ${height ?? "h-12"} items-end`}>
				{metrics

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
						"flex-1 bg-white rounded-sm border border-white transition-all duration-150 px-px hover:scale-110 py-1 ",
					];

					if (bucket.time < 0) {
						cn.push("  bg-zinc-400/20 hover:bg-zinc-400/50 ");
					} else if (bucketTimeout) {
						cn.push(" bg-red-500  ");
					} else if (bucketDegraded) {
						cn.push(" bg-yellow-400  ");
					} else {
						cn.push(" bg-emerald-400");
					}

					return (
						<HoverCard.Root openDelay={50} closeDelay={40} key={bucket.time}>
							<HoverCard.Trigger
								className={cn.join(" ")}
								style={{
									height: `${percentageHeight}%`,
								}}
							/>
							<HoverCard.Portal>
								<HoverCard.Content>
									<>
										{bucket.time >= 0 ? (
											<>
												<div className="px-4 py-5 overflow-hidden bg-white rounded-sm shadow sm:p-6">
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
														<dl className="grid grid-cols-1 gap-2 mt-5 md:grid-cols-5 ">
															<Stats
																label="Checks"
																value={format(bucket.count)}
															/>
															<Stats
																label="P50"
																value={format(bucket.p50)}
																suffix="ms"
															/>
															<Stats
																label="P95"
																value={format(bucket.p95)}
																suffix="ms"
															/>
															<Stats
																label="P99"
																value={format(bucket.p99)}
																suffix="ms"
															/>
															<Stats
																label="Errors"
																value={format(bucket.errors)}
															/>
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
