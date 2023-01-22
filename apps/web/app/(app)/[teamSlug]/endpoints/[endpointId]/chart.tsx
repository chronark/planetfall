"use client";

import React from "react";
import { Area, Line, TinyArea } from "@ant-design/plots";
import { Check } from "@planetfall/tinybird";
import { Region } from "@prisma/client";

type Props = {
	checks: Check[];
	regions: Region[];
	endpoint: {
		timeout: number | null;
		degradedAfter: number | null;
	};
};

export const Charts: React.FC<Props> = ({ checks, regions, endpoint }) => {
	const checksByRegion = checks.reduce((acc, check) => {
		if (!acc[check.regionId]) {
			acc[check.regionId] = [];
		}
		acc[check.regionId].push(check);
		return acc;
	}, {} as Record<string, Check[]>);
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{Object.entries(checksByRegion).map(([regionId, checks]) => (
				<div
					key={regionId}
					className="relative col-span-1 border rounded border-zinc-300"
				>
					<span className="p-2 text-sm font-medium text-zinc-700">
						{regions.find((r) => r.id === regionId)?.name ?? regionId}
					</span>
					<div className="w-full h-20">
						<Chart endpoint={endpoint} checks={checks} />
					</div>
				</div>
			))}
		</div>
	);
};

function toRGBA(color: number[], alpha: number = 1) {
	return `rgba(${color.join(",")},${alpha})`;
}

type ChartProps = {
	endpoint: {
		timeout: number | null;
		degradedAfter: number | null;
	};
	checks: Check[];
};

const Chart: React.FC<ChartProps> = ({ endpoint, checks }) => {
	const colors = {
		success: [59, 130, 246],
		degraded: [259, 115, 22],
		failed: [239, 68, 68],
	};

	let state: keyof typeof colors = "success";
	for (const check of checks) {
		if (check.latency && endpoint.timeout && check.latency > endpoint.timeout) {
			state = "failed";
			break;
		}
		if (
			check.latency &&
			endpoint.degradedAfter &&
			check.latency > endpoint.degradedAfter
		) {
			state = "degraded";
			break;
		}
	}
	const annotations: any = [];

	if (endpoint.timeout) {
		annotations.push({
			type: "line",
			start: ["min", endpoint.timeout],
			end: ["max", endpoint.timeout],
			text: {
				content: "Timeout",
				offsetY: -2,
				style: {
					textAlign: "left",
					fontSize: 10,
					fill: colors.failed,
					textBaseline: "bottom",
				},
			},
			style: {
				stroke: toRGBA(colors.failed, 0.5),
			},
		});
	}
	if (endpoint.degradedAfter) {
		annotations.push({
			type: "line",
			start: ["min", endpoint.degradedAfter],
			end: ["max", endpoint.degradedAfter],
			text: {
				content: "Degraded",
				offsetY: -2,
				style: {
					textAlign: "left",
					fontSize: 10,
					fill: colors.degraded,
					textBaseline: "bottom",
				},
			},
			style: {
				stroke: toRGBA(colors.degraded, 0.5),
			},
		});
	}

	return (
		<Area
			padding={[0, -4, 0, -4]}
			data={checks.map((c) => ({
				latency: c.latency ?? 0,
				time: new Date(c.time).toLocaleString(),
			}))}
			xField="time"
			yField="latency"
			smooth={true}
			annotations={annotations}
			line={{
				color: toRGBA(colors[state]),
			}}
			autoFit={true}
			color={toRGBA(colors[state], 0.1)}
			xAxis={false}
			yAxis={false}
			tooltip={{
				formatter: (datum) => ({
					name: "Latency Latency",
					value: `${Intl.NumberFormat().format(datum.latency)} ms`,
				}),
			}}
		/>
	);
};
