import { db } from "@planetfall/db";
import { Row } from "./chart";

import React from "react";
import Link from "next/link";
import { Text } from "@/components/text";
import { getStats } from "./get-stats";
import { RelativeTime } from "./RelativeTime";

export const revalidate = 60;

export default async function Page(props: { params: { slug: string } }) {
	const now = Date.now();
	const statusPage = await db.statusPage.findUnique({
		where: { slug: props.params.slug },
		include: {
			endpoints: {
				include: { regions: true },
			},
			team: true,
		},
	});
	if (!statusPage) {
		return null;
	}
	const regions = await db.region.findMany({});

	const endpoints = await Promise.all(
		statusPage.endpoints.map(async (endpoint) =>
			getStats(endpoint, statusPage.team.maxTimeout),
		),
	);

	return (
		<div className="flex flex-col min-h-screen px-4 overflow-hidden md:px-0 ">
			<header className="container flex items-center justify-between w-full mx-auto mt-4 lg:mt-8 ">
				<h2 className="mb-4 text-5xl font-bold text-zinc-900">
					{statusPage.name}
				</h2>

				<Text>
					Last updated <RelativeTime time={now} />
				</Text>
			</header>
			<main className="container min-h-screen mx-auto md:py-16 ">
				<ul
					className="flex flex-col gap-4 lg:gap-8" // initial="hidden"
					// animate="show"
					// variants={{
					//   hidden: {},
					//   show: {
					//     transition: {
					//       staggerChildren: 0.1,
					//     },
					//   },
					// }}
				>
					{endpoints.map((endpoint, i) => (
						<li
							key={endpoint.url}
							// variants={{
							//   hidden: { scale: 0.9, opacity: 0 },
							//   show: { scale: 1, opacity: 1, transition: { type: "spring" } },
							// }}
						>
							<Row
								key={endpoint.url}
								endpoint={endpoint}
								regions={regions.map((r) => ({ id: r.id, name: r.name }))}
							/>
						</li>
					))}
				</ul>
			</main>
			<footer className="inset-x-0 bottom-0 py-16 border-t">
				<p className="text-center text-zinc-400">
					Powered by{" "}
					<Link
						className="font-medium duration-150 text-zinc-500 hover:text-zinc-600"
						href="https://planetfall.io"
					>
						planetfall.io
					</Link>
				</p>
			</footer>
		</div>
	);
}
