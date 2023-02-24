"use client";

import React from "react";
import { Column } from "@ant-design/plots";
import { PlayChecks } from "lib/server/routers/play";

type Props = {
	regions: PlayChecks["regions"];
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
						url: r.checks[0].url,
						latency: r.checks[0]?.latency ?? -1,
					},
					{
						region: r.name,
						url: r.checks[1].url,
						latency: r.checks[1]?.latency ?? -1,
					},
				])}
				isGroup={true}
				seriesField="type"
				xField="region"
				yField="latency"
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
				color={["#3b82f6", "#ef4444"]}
			/>
		);
	} else {
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
