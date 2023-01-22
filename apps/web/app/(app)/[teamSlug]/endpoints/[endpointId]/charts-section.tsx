"use client";

import { Heading } from "@/components/heading";
import { MultiSelect } from "@/components/multiselect";
import { Check } from "@planetfall/tinybird";
import { Endpoint, Region } from "@prisma/client";
import { useState } from "react";
import { Charts } from "./chart";

type Props = {
	checks: Check[];
	endpoint: Endpoint & { regions: Region[] };
};

export const ChartsSection: React.FC<Props> = ({ endpoint, checks }) => {
	const [selected, setSelected] = useState(endpoint.regions.map((r) => r.id));
	return (
		<>
			<div className="flex items-center justify-between">
				<Heading h3={true}>Checks by region</Heading>
				{/* <MultiSelect
					options={endpoint.regions}
					selected={selected}
					setSelected={setSelected}
				/> */}
			</div>
			<Charts checks={checks} regions={endpoint.regions} endpoint={endpoint} />
		</>
	);
};
