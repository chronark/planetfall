"use client";

import React, { useEffect, useState } from "react";
import { Bar, Column } from "@ant-design/plots";
import { PlayChecks } from "lib/server/routers/play";
import { EndpointStats } from "@planetfall/tinybird";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/select";
import { Heading } from "@/components/heading";
import { BarList } from "@tremor/react";
import { Text } from "@/components/text";
type Props = {
	regions: (EndpointStats & { region: string })[];
	endpoint: {
		timeout?: number;
		degradedAfter?: number;
	};
};

export const Chart: React.FC<Props> = ({ regions, endpoint }) => {
	const [selected, setSelected] = useState("p99");
	const [showTopBottom, setShowTopBottom] = useState(regions.length > 10);
	const lookup = regions.reduce((acc, r) => {
		// @ts-ignore
		acc[r.region] = r[selected];
		return acc;
	}, {} as Record<string, number>);
	// @ts-ignore
	const sorted = regions.sort((a, b) => a[selected] - b[selected]);
	const data = showTopBottom
		? sorted.slice(0, 5).concat(sorted.slice(-5))
		: sorted;

	return (
		<div className="flex flex-col space-y-4">
			<div className="flex items-center justify-between w-full gap-4">
				<Heading h3={true}>Latency by Region</Heading>

				<div className="flex items-center justify-between gap-4">
					{regions.length > 10 ? (
						<Select onValueChange={(v) => setShowTopBottom(v === "true")}>
							<SelectTrigger>
								<SelectValue placeholder="Show Best and Worst" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="true">Show Best and Worst</SelectItem>
								<SelectItem value="false">Show All</SelectItem>
							</SelectContent>
						</Select>
					) : null}
					<Select onValueChange={(v) => setSelected(v)}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder={selected} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="p50">P50</SelectItem>
							<SelectItem value="p95">P95</SelectItem>
							<SelectItem value="p99">P99</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			<div className="">
				<Bar
					// @ts-ignore
					data={data}
					yField="region"
					xField={selected}
					legend={{
						position: "top",
					}}
					isStack={true}
					color={(datum) => {
						if (endpoint.timeout && lookup[datum.region] > endpoint.timeout) {
							return "#ef4444";
						}
						if (
							endpoint.degradedAfter &&
							lookup[datum.region] > endpoint.degradedAfter
						) {
							return "#f97316";
						}
						return "#3366FF";
					}}
					xAxis={{
						maxTickCount: 3,

						title: { text: "Latency (ms)" },
					}}
					tooltip={{
						formatter: (datum) => {
							return {
								name: selected,
								value: `${Intl.NumberFormat(undefined).format(
									Math.round(datum[selected]),
								)} ms`,
							};
						},
					}}
				/>
			</div>
		</div>
	);
};
