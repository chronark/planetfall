"use client";

import React from "react";
import * as checkApi from "pages/api/v1/checks";
import * as Tabs from "@radix-ui/react-tabs";
import { Heading } from "@/components/heading";
import { Stats } from "@/components/stats";
import { Trace } from "@/components/trace";

type Props = {
	checks: checkApi.Output["data"];
};

export const Details: React.FC<Props> = ({ checks }) => {
	return (
		<Tabs.Root defaultValue={checks![0].region.id}>
			<Tabs.List className="flex items-center justify-center space-x-4">
				{checks?.map((r) => (
					<Tabs.Trigger
						key={r.region.id}
						value={r.region.id}
						className="border-b border-transparent text-zinc-700 radix-state-active:text-zinc-900 radix-state-active:border-zinc-800"
					>
						{r.region.name}
					</Tabs.Trigger>
				))}
			</Tabs.List>
			{checks?.map((r) => (
				<Tabs.Content
					key={r.region.id}
					value={r.region.id}
					className="flex flex-col justify-between w-full divide-y md:flex-row md:divide-y-0 "
				>
					{r.checks
						.sort((a, b) => a.time - b.time)
						.map((c, i) => (
							<div
								key={i}
								className={`${
									r.checks.length > 1 ? "w-1/2" : "w-full"
								} p-4 flex flex-col divide-y divide-zinc-200`}
							>
								<div className="flex flex-col items-center justify-between">
									{r.checks.length > 1 ? (
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
									<pre className="p-2 rounded bg-zinc-50">
										{JSON.stringify(c.headers, null, 2)}
									</pre>
								</div>
								<div className="py-4 md:py-8">
									<Heading h4={true}>Response Body</Heading>
									<pre className="p-2 rounded bg-zinc-50">
										{atob(c.body ?? "")}
									</pre>
								</div>
							</div>
						))}
				</Tabs.Content>
			))}
		</Tabs.Root>
	);
};
