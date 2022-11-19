"use client";

import React from "react";
import * as checkApi from "pages/api/v1/checks";
import { BarChart } from "@tremor/react";

type Props = {
	checks: checkApi.Output["data"];
};

export const Chart: React.FC<Props> = ({ checks }) => {
	return (
		<BarChart
			data={checks!.map((r) => {
				const x: Record<string, string | number> = {
					region: r.region.name,
				};
				if (r.checks.length > 1) {
					r.checks = r.checks.sort((a, b) => a.time - b.time);
					x.Cold = r.checks[0].latency!;
					x.Hot = r.checks[1].latency!;
				} else {
					x.Latency = r.checks[0].latency!;
				}
				return x;
			})}
			dataKey="region"
			categories={
				checks && checks.length > 0 && checks[0].checks.length > 1
					? ["Cold", "Hot"]
					: ["Latency"]
			}
			colors={["blue", "red"]}
			valueFormatter={(n: number) => `${n.toLocaleString()} ms`}
		/>
	);
};
