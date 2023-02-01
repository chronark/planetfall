"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardHeaderTitle,
} from "@/components/card";
import { Heading } from "@/components/heading";
import { MultiSelect } from "@/components/multiselect";
import {
	SelectItem,
	SelectTrigger,
	Select,
	SelectContent,
	SelectValue,
} from "@/components/select";
import { Area, Line } from "@ant-design/plots";
import { Check } from "@planetfall/tinybird";
import { Region } from "@prisma/client";
import { useMemo, useState } from "react";

type Props = {
	checks: Check[];
	endpoint: {
		timeout: number | null;
		degradedAfter: number | null;
		regions: Region[];
	};
};

function regionIdToName(regions: Region[], regionId: string) {
	return regions.find((r) => r.id === regionId)?.name ?? regionId;
}

export const ChartsSection: React.FC<Props> = ({ endpoint, checks }) => {
	const [selectedRegion, setSelectedRegion] = useState(checks[0].regionId);

	const checksByRegion = useMemo(() => {
		return checks.filter((check) => check.regionId === selectedRegion);
	}, [checks, selectedRegion]);

	return (
		<Card>
			<CardHeader>
				<CardHeaderTitle title="Latency" />
				<div>
					<Select onValueChange={(v) => setSelectedRegion(v)}>
						<SelectTrigger>
							<SelectValue
								placeholder={regionIdToName(endpoint.regions, selectedRegion)}
							/>
						</SelectTrigger>
						<SelectContent>
							{endpoint.regions.map((r) => (
								<SelectItem key={r.id} value={r.id}>
									{r.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent>
				<Chart endpoint={endpoint} checks={checksByRegion} />
			</CardContent>
		</Card>
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

const Chart: React.FC<Props> = ({ endpoint, checks }) => {
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
	const max = Math.max(...checks.map((c) => c.latency ?? 0));
	const annotations: any = [];

	if (endpoint.timeout && max > endpoint.timeout) {
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
	if (endpoint.degradedAfter && max > endpoint.degradedAfter) {
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
		<Line
			data={checks.map((c) => ({
				latency: c.latency ?? 0,
				time: new Date(c.time).toLocaleString(),
			}))}
			xField="time"
			yField="latency"
			smooth={true}
			annotations={annotations}
			// line={{
			// 	color: toRGBA(colors[state]),
			// }}
			autoFit={true}
			color={toRGBA(colors[state])}
			xAxis={{
				title: { text: "Time" },
				maxTickCount: 5,
			}}
			yAxis={{
				maxTickCount: 5,
				title: { text: "Latency (ms)" },
			}}
			tooltip={{
				formatter: (datum) => {
					return {
						name: "Latency",
						value: `${Intl.NumberFormat(undefined).format(
							Math.round(datum.latency),
						)} ms`,
					};
				},
			}}
		/>
	);
};
