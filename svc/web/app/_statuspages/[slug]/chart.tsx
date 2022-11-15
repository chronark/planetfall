"use client";

import classNames from "classnames";
import * as HoverCard from "@radix-ui/react-hover-card";
import { useState } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { Stats } from "@/components/stats";
import { Heading } from "@/components/heading";

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => {
	return (
		<div className="flex items-center text-sm text-zinc-500 space-x-1 whitespace-nowrap">
			<span className="flex-shrink-0 font-semibold">{label}:</span>
			<span>{value.toLocaleString()} ms</span>
		</div>
	);
};

export type Metric = {
	time: string;
	min: number;
	max: number;
	p50: number;
	p95: number;
	p99: number;
};

export const Row: React.FC<{
	endpoint: {
		id: string;
		name?: string;
		url: string;
		metrics: Metric[];
		regions: Record<string, Metric[]>;
	};
}> = ({ endpoint }): JSX.Element => {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className="my-16 list-none border-t  sm:border border-zinc-300 sm:border-zinc-100 sm:shadow-ambient md:rounded hover:border-zinc-800 duration-1000">
			<div className="flex flex-col items-start justify-between px-4 py-5 border-b gap-2 lg:flex-row border-zinc-200  sm:px-6 md:items-center">
				<div className="lg:w-1/2">
					<span className="text-lg font-medium leading-6 text-zinc-900">
						{endpoint.name ?? endpoint.url}
					</span>
				</div>
				<div className="flex flex-wrap items-center justify-between lg:w-1/2 gap-2 sm:gap-4 xl:gap-6 md:flex-nowrap">
					<Stat
						label="min"
						value={Math.round(endpoint.metrics.at(-1)?.min ?? 0)}
					/>
					<Stat
						label="max"
						value={Math.round(endpoint.metrics.at(-1)?.max ?? 0)}
					/>
					<Stat
						label="p50"
						value={Math.round(endpoint.metrics.at(-1)?.p50 ?? 0)}
					/>
					<Stat
						label="p95"
						value={Math.round(endpoint.metrics.at(-1)?.p95 ?? 0)}
					/>
					<Stat
						label="p99"
						value={Math.round(endpoint.metrics.at(-1)?.p99 ?? 0)}
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

				<button className="relative" onClick={() => setExpanded(!expanded)}>
					<div
						className="absolute inset-0 flex items-center"
						aria-hidden="true"
					>
						<div className="w-full border-t border-zinc-200" />
					</div>
					<div className="relative flex justify-center">
						<span className="px-2 bg-white  text-zinc-500 hover:text-primary-500">
							{expanded ? (
								<MinusIcon className="w-6 h-6" />
							) : (
								<PlusIcon className="w-6 h-6" />
							)}
						</span>
					</div>
				</button>

				<AnimatePresence>
					{expanded ? (
						<motion.ul
							className="space-y-4 lg:space-y-8"
							initial="hidden"
							animate="show"
							variants={{
								hidden: {},
								show: {
									transition: {
										staggerChildren: 0.1,
									},
								},
							}}
						>
							{Object.entries(endpoint.regions).map(([region, metrics]) => {
								return (
									<motion.li
										key={region}
										variants={{
											hidden: { scale: 0.8, opacity: 0 },
											show: { scale: 1, opacity: 1 },
										}}
									>
										<Heading h4={true}>{region}</Heading>

										<div className="hidden lg:block">
											<Chart metrics={metrics} nBuckets={72} />
										</div>
										<div className="lg:hidden">
											<Chart metrics={metrics} nBuckets={24} />
										</div>
									</motion.li>
								);
							})}
						</motion.ul>
					) : null}
				</AnimatePresence>
			</div>
		</div>
	);
};

const Chart: React.FC<{
	height?: string;
	metrics: Metric[];
	withAvailability?: boolean;
	nBuckets: number;
}> = ({ metrics, height, withAvailability }): JSX.Element => {
	const max = Math.max(...metrics.map((m) => m.max));

	let t = new Date();
	t.setMinutes(0);
	t.setSeconds(0);
	t.setMilliseconds(0);

	const errors = 0; // endpoint.checks.filter((s) => s.error).length;
	const availability = 1; //1endpoint.checks.length > 0
	// ? 1 - (errors / endpoint.checks.length)
	// : 1;
	return (
		<div>
			{withAvailability ? (
				<div className="relative mb-2">
					<div
						className="absolute inset-0 flex items-center"
						aria-hidden="true"
					>
						<div
							className={classNames("w-full border-t", {
								"border-emerald-500": availability >= 0.99,
								"border-orange-500":
									availability < 0.99 && availability >= 0.95,
								"border-rose-500": availability < 0.95,
							})}
						/>
					</div>
					<div className="relative flex justify-center">
						<span
							className={classNames("bg-white px-2 text-sm", {
								"text-emerald-500": availability >= 0.99,
								"text-orange-500": availability < 0.99 && availability >= 0.95,
								"text-rose-500": availability < 0.95,
							})}
						>
							{(availability * 100).toFixed(2)}%
						</span>
					</div>
				</div>
			) : null}
			<div className={`flex space-x-1 ${height ?? "h-12"} items-end`}>
				{metrics
					.sort(
						(a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
					)
					.map((bucket, i) => {
						const start = new Date(bucket.time);
						const end = new Date(start.getTime() + 60 * 60 * 1000);

						const height =
							bucket.time === ""
								? 100
								: Math.min(1, Math.log(bucket.p99) / Math.log(max)) * 100;

						const bucketErrors = 0; //= bucket.filter((c) => c.error);
						const bucketDegraded = 0; //= endpoint.degradedAfter
						// ? p99 > endpoint.degradedAfter
						// : 0;
						const cn = [
							"flex-1 h-full rounded-sm  transition-all duration-150",
						];

						if (bucket.time === "") {
							cn.push(
								"bg-zinc-50 border border-zinc-300 hover:bg-zinc-200 animate-pulse",
							);
						} else if (bucketErrors > 0) {
							cn.push("bg-red-400 border border-red-600 hover:bg-red-100");
						} else if (bucketDegraded > 0) {
							cn.push(
								"bg-yellow-300 border border-yellow-500 hover:bg-yellow-100",
							);
						} else {
							cn.push(
								"bg-emerald-300 border border-emerald-500 hover:bg-emerald-100",
							);
						}

						return (
							<HoverCard.Root openDelay={50} closeDelay={40} key={i}>
								<HoverCard.Trigger
									key={i}
									className={cn.join(" ")}
									style={{
										height: `${height}%`,
									}}
								/>{" "}
								<HoverCard.Portal>
									<HoverCard.Content>
										{bucket.time !== "" ? (
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
														<dl className="mt-5 grid grid-cols-1 md:grid-cols-3 ">
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
																	value={item.value.toLocaleString()}
																	suffix="ms"
																	// status={endpoint.degradedAfter
																	//     ? item.value >= endpoint.degradedAfter
																	//         ? "warn"
																	//         : "success"
																	//     : undefined}
																/>
															))}
														</dl>
														{/* <Divider /> */}
														{/* {bucketErrors > 0
                                                                    ? (
                                                                        <div>
                                                                            <Heading h3>Errors</Heading>
                                                                            <ul className="divide-y divide-zinc-100">
                                                                                {bucketErrors.map((err, i) => (
                                                                                    <li
                                                                                        key={i}
                                                                                        className="relative py-3 bg-white hover:bg-zinc-50 "
                                                                                    >
                                                                                        <div className="flex justify-between space-x-3">
                                                                                            <time
                                                                                                dateTime={new Date(err.time)
                                                                                                    .toLocaleString()}
                                                                                                className="text-sm font-medium truncate text-zinc-900"
                                                                                            >
                                                                                                {new Date(err.time)
                                                                                                    .toLocaleString()}
                                                                                            </time>
                                                                                            <span className="flex-shrink-0 text-sm whitespace-nowrap text-zinc-500">
                                                                                                {err.region}
                                                                                            </span>
                                                                                        </div>
                                                                                        <span className="text-sm text-zinc-600 line-clamp-2">
                                                                                            {err.error}
                                                                                        </span>
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )
                                                                    : null} */}
													</div>
												</div>
												<HoverCard.Arrow />
											</>
										) : null}
									</HoverCard.Content>
								</HoverCard.Portal>
							</HoverCard.Root>
						);
					})}
			</div>
		</div>
	);
};
