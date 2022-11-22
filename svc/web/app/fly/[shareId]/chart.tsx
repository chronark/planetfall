"use client";

import React from "react";
import * as checkApi from "pages/api/v1/checks";
import { Shared } from "pages/api/v1/fly/curl";
import { Column } from "@ant-design/plots";

type Props = {
	regions: Shared["regions"];
};

const defaultStyle = {
	columnStyle: {
		radius: [2, 2, 0, 0],
	},
};
export const Chart: React.FC<Props> = ({ regions }) => {
	if (regions[0].checks.length > 1) {
		return (
			<Column
				{...defaultStyle}
				data={regions

				.flatMap((r) => [
					{
						region: r.name,
						type: "Cold",
						latency: r.checks[0].latency,
					},
					{
						region: r.name,
						type: "Hot",
						latency: r.checks[1].latency,
					},
				])}
				isGroup={true}
				seriesField="type"
				xField="region"
				yField="latency"
				xAxis={{
					title: { text: "Regions" },
				}}
				yAxis={{
					maxTickCount: 3,
					title: { text: "Latency (ms)" },
				}}
				color={["#3b82f6", "#ef4444"]}
			/>
		);
	} else {
		console.log(regions);
		return (
			<Column
				{...defaultStyle}
				data={regions.map((r) => ({
					region: r.name,
					Latency: r.checks[0].latency!,
				}))}
				xField="region"
				yField="Latency"
				color={["#3366FF"]}
				seriesField="region"
				legend={false}
				xAxis={{
					title: { text: "Regions" },
					label: {
						autoRotate: true,
					},
				}}
				yAxis={{
					maxTickCount: 3,

					title: { text: "Latency (ms)" },
				}}
				tooltip={{
					formatter: (datum) => ({
						name: datum.region,
						value: `${datum.Latency} ms`,
					}),
				}}
			/>
		);
	}
};
