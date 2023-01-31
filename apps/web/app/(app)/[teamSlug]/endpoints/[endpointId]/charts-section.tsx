"use client";

import { Heading } from "@/components/heading";
import { MultiSelect } from "@/components/multiselect";
import { Check } from "@planetfall/tinybird";
import { Endpoint, Region } from "@prisma/client";
import { useMemo, useState } from "react";
import { Charts } from "./charts";

type Props = {
	checks: Check[];
	endpoint: {
		timeout: number | null;
		degradedAfter: number | null;
		regions: Region[];
	};
};

export const ChartsSection: React.FC<Props> = ({ endpoint, checks }) => {
	const statusOptions = [
		{ name: "Success", id: "success" },
		{ name: "Error", id: "error" },
		{ name: "Degraded", id: "degraded" },
	];
	const [selected, setSelected] = useState(statusOptions.map((s) => s.id));

	const checksByRegion = checks.reduce((acc, check) => {
		if (!acc[check.regionId]) {
			acc[check.regionId] = [];
		}
		acc[check.regionId].push(check);
		return acc;
	}, {} as Record<string, Check[]>);

	const filtered = useMemo(
		() =>
			Object.values(checksByRegion).flatMap((checks) => {
				let state: string = "success";
				for (const check of checks) {
					if (
						check.latency &&
						endpoint.timeout &&
						check.latency > endpoint.timeout
					) {
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
				if (selected.includes(state)) {
					return checks;
				} else {
					return [];
				}
			}),
		[selected, checks, endpoint],
	);

	return (
		<>
			<div className="flex items-center justify-between">
				<Heading h3={true}>Checks by region</Heading>
				<MultiSelect
					options={statusOptions}
					selected={selected}
					setSelected={setSelected}
				/>
			</div>
			<Charts
				checks={filtered}
				regions={endpoint.regions}
				endpoint={endpoint}
			/>
		</>
	);
};
