import React from "react";
import { db } from "@planetfall/db";
import { asyncComponent } from "lib/api/component";
import { clerkClient } from "@clerk/clerk-sdk-node";

export const revalidate = 60 * 60; // revalidate every hour

export const Stats = asyncComponent(async () => {
	const rng = Math.random();
	console.time(`stats${rng}`);
	const stats = await Promise.all([
		{
			label: "Teams",
			value: await db.team.count(),
		},
		{
			label: "APIs",
			value: await db.endpoint.count(),
		},
		{
			label: "Ø Checks Per Day",
			value: await fetch(
				"https://api.tinybird.co/v0/pipes/checks_in_last_day.json",
				{
					headers: {
						Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`,
					},
				},
			)
				.then(
					async (res) => (await res.json()) as { data: { checks: number }[] },
				)
				.then((res) => {
					if (!Array.isArray(res.data)) {
						return -1;
					}
					if (res.data.length === 0) {
						return -1;
					}

					return res.data[0].checks;
				}),
		},
	]);
	console.timeEnd(`stats${rng}`);
	return (
		<section id="stats">
			<div className="relative py-16 sm:py-24 lg:py-32">
				<div className="container mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
					{stats.map(({ label, value }) => (
						<div
							key={label}
							className="overflow-hidden rounded px-4 m py-3 flex sm:flex-col items-center justify-between gap-2"
						>
							<dt className="text-center  text-lg leading-6  text-slate-500">
								{label}
							</dt>
							<dd className="text-center text-2xl  sm:text-5xl font-bold tracking-tight text-slate-100">
								{value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
							</dd>
						</div>
					))}
				</div>
			</div>
		</section>
	);
});
