import React from "react";
import { db } from "@planetfall/db";
import { asyncComponent } from "lib/api/component";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import CountingNumbers from "./counting-numbers";


export const revalidate = 360; // revalidate every hour

export const Stats = asyncComponent(async () => {
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
				"https://api.tinybird.co/v0/pipes/production__checks_in_last_day__v1.json",
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
	return (
		<section id="stats">
			<div className="relative py-16 sm:py-24 lg:py-32">
				<div className="container grid grid-cols-1 gap-4 mx-auto mt-8 sm:grid-cols-3 md:mt-16">
					{stats.map(({ label, value }) => (
						<div
							key={label}
							className="flex items-center justify-between gap-2 px-4 py-3 overflow-hidden rounded m sm:flex-col"
						>
							<dt className="text-lg leading-6 text-center text-zinc-500">
								{label}
							</dt>
							<dd className="text-2xl font-bold tracking-tight text-center sm:text-5xl text-zinc-100">
								<CountingNumbers value={value} />
							</dd>
						</div>
					))}
				</div>
			</div>
		</section>
	);
});
