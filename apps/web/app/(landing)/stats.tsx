import React from "react";
import { db } from "@planetfall/db";
import { asyncComponent } from "lib/api/component";

import CountingNumbers from "./counting-numbers";
import { Section } from "./section";


export const dynamic = "force-static";
export const revalidate = 3600;

export const Stats = asyncComponent(async () => {
	const stats = await Promise.all([
		{
			label: "Teams",
			value: await db.team.count(),
		},
		{
			label: "Endpoints",
			value: await db.endpoint.count(),
		},
		{
			label: "Status Pages",
			value: await db.statusPage.count(),
		},
		{
			label: "Ø Checks Per Day",
			value: await fetch(
				"https://api.tinybird.co/v0/pipes/average_usage__v1.json",
				{
					headers: {
						Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`,
					},
				},
			)
				.then(
					async (res) => (await res.json()) as { data: { average: number }[] },
				)
				.then((res) => {
					if (!Array.isArray(res.data)) {
						return -1;
					}
					if (res.data.length === 0) {
						return -1;
					}

					return res.data[0].average;
				}),
		},
	]);
	return (
		<Section id="stats">
			<div className="container grid grid-cols-1 gap-4 mx-auto sm:grid-cols-2 md:grid-cols-4">
				{stats.map(({ label, value }) => (
					<div
						key={label}
						className="flex items-center justify-between gap-2 px-4 py-3 overflow-hidden rounded m sm:flex-col"
					>
						<dt className="text-lg leading-6 text-center text-zinc-500">
							{label}
						</dt>
						<dd className="text-2xl font-bold tracking-tight text-center sm:text-5xl text-zinc-900">
							<CountingNumbers value={value} />
						</dd>
					</div>
				))}
			</div>
		</Section>
	);
});
