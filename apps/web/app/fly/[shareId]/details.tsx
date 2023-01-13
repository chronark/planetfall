"use client";

import React from "react";
import { Heading } from "@/components/heading";
import { Stats } from "@/components/stats";
import { Trace } from "@/components/trace";
import { Shared } from "pages/api/v1/fly/curl";
import * as Select from "@radix-ui/react-select";
import {
	CheckIcon,
	ChevronDownIcon,
	ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/page";

type Props = {
	regions: Shared["regions"];
};

export const Details: React.FC<Props> = ({ regions }) => {
	const [selectedRegion, setSelectedRegion] = React.useState<
		Shared["regions"][0] | undefined
	>(regions[0]);
	return (
		<>
			<PageHeader
				title="Details"
				description="A detailed breakdown by region, including the response and a latency trace"
				actions={[
					<Select.Root
						defaultValue={selectedRegion?.id}
						onValueChange={(id) =>
							setSelectedRegion(regions.find((r) => r.id === id)!)
						}
					>
						<Select.Trigger asChild={true}>
							<button className="flex items-center gap-2 px-3 py-1 font-medium text-center transition-all duration-300 border rounded whitespace-nowrap focus:outline-none bg-zinc-800 text-zinc-50 hover:bg-zinc-50 hover:text-zinc-900 border-zinc-700 ">
								<Select.Value />
								<Select.Icon>
									<ChevronDownIcon className="w-4 h-4" />
								</Select.Icon>
							</button>
						</Select.Trigger>
						<Select.Portal>
							<Select.Content>
								<Select.ScrollUpButton className="flex items-center justify-center text-gray-700 dark:text-gray-300">
									<ChevronUpIcon className="w-4 h-4" />
								</Select.ScrollUpButton>
								<Select.Viewport className="p-2 bg-white rounded-lg shadow-lg dark:bg-gray-800">
									<Select.Group>
										{regions.map((r, i) => (
											<Select.Item
												key={r.id}
												value={r.id}
												className={`hover:ring-0 gap-4 lg:gap-8 xl:gap-16 group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 ${
													r.id === selectedRegion?.id ? "bg-zinc-100" : ""
												}`}
											>
												<Select.ItemText>{r.name}</Select.ItemText>
												<Select.ItemIndicator>
													<CheckIcon className="w-4 h-4" />
												</Select.ItemIndicator>
											</Select.Item>
										))}
									</Select.Group>
								</Select.Viewport>
								<Select.ScrollDownButton className="flex items-center justify-center text-gray-700 dark:text-gray-300">
									<ChevronDownIcon className="w-4 h-4" />
								</Select.ScrollDownButton>
							</Select.Content>
						</Select.Portal>
					</Select.Root>,
				]}
			/>

			<div className="flex flex-col justify-between w-full divide-y md:flex-row md:divide-y-0 ">
				{selectedRegion?.checks
					.sort((a, b) => a.time - b.time)
					.map((c, i) => (
						<div
							key={i}
							className={`${
								selectedRegion.checks.length > 1 ? "lg:w-1/2" : "w-full"
							} p-4 flex flex-col divide-y divide-zinc-200`}
						>
							<div className="flex flex-col items-center justify-between">
								{selectedRegion.checks.length > 1 ? (
									<>
										<Heading h3={true}>{i === 0 ? "Cold" : "Hot"}</Heading>
										<span className="text-sm text-zinc-500">
											{new Date(c.time).toISOString()}
										</span>
									</>
								) : null}
								<div className="flex">
									<Stats
										label="Latency"
										value={c.latency!.toLocaleString()}
										suffix="ms"
									/>

									<Stats label="Status" value={c.status} />
								</div>
							</div>
							<div className="py-4 md:py-8">
								<Heading h4={true}>Trace</Heading>

								<Trace timings={c.timing} />
							</div>
							<div className="py-4 md:py-8">
								<Heading h4={true}>Response Header</Heading>
								<pre className="p-2 overflow-x-auto rounded bg-zinc-50">
									{JSON.stringify(c.headers, null, 2)}
								</pre>
							</div>
							<div className="py-4 md:py-8">
								<Heading h4={true}>Response Body</Heading>
								<pre className="p-2 overflow-x-auto rounded bg-zinc-50">
									{atob(c.body ?? "")}
								</pre>
							</div>
						</div>
					))}
			</div>
		</>
	);
};
