import { Heading } from "@/components/heading";
import PageHeader from "@/components/page/header";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Redis } from "@upstash/redis";
import type { Input } from "pages/api/v1/play/share";
import { Chart } from "./chart";
import { Table } from "./table";
import { Details } from "./details";
import { PlayChecks } from "lib/server/routers/play";
import { DateDisplay } from "./DateDisplay";
import { Text } from "@/components/text";
const redis = Redis.fromEnv();

export const revalidate = 3600;

export default async function Share(props: { params: { shareId: string } }) {
	const res = await redis.get<PlayChecks>(
		["play", props.params.shareId].join(":"),
	);
	if (!res) {
		return notFound();
	}

	const { url, time } = res;
	console.log(res.regions.map((r) => r.checks.map((c) => c.tags)));
	const tags = [
		...new Set(res.regions.flatMap((r) => r.checks).flatMap((c) => c.tags)),
	];
	console.log({ tags });
	const regions = res.regions
		.filter((r) => r.checks.length > 0)
		.sort((a, b) => (b.checks[0].latency ?? 0) - (a.checks[0].latency ?? 0));
	return (
		<>
			<header className="fixed top-0 z-50 w-full backdrop-blur">
				<div className="container mx-auto">
					<div className="flex items-center justify-between h-16 md:h-20">
						{/* Site branding */}
						<div className="mr-4 shrink-0">
							{/* Logo */}
							<Link href="/" aria-label="Planetfall">
								<div className="flex items-center gap-2 group ">
									<Logo className="w-10 h-10 duration-500 group-hover:text-zinc-700 text-zinc-900" />
									<span className="text-2xl font-semibold duration-500 group-hover:text-black text-zinc-900">
										Planetfall
									</span>
								</div>
							</Link>
						</div>
						{/* Desktop navigation */}
						<nav className="flex items-center grow">
							<ul className="flex flex-wrap items-center justify-end gap-8 grow">
								<li className="hidden md:block">
									<Link
										className="flex items-center px-3 py-2 font-medium transition duration-150 ease-in-out text-zinc-500 hover:text-zinc-700 lg:px-5"
										href="/docs"
									>
										Docs
									</Link>
								</li>
								<li className="hidden md:block">
									<Link
										className="flex items-center px-3 py-2 font-medium transition duration-150 ease-in-out text-zinc-500 hover:text-zinc-700 lg:px-5"
										href="/play"
									>
										Play
									</Link>
								</li>
								<li className="hidden md:block">
									<Link
										className="flex items-center px-3 py-2 font-medium transition duration-150 ease-in-out text-zinc-500 hover:text-zinc-700 lg:px-5"
										href="/home"
									>
										Dashboard
									</Link>
								</li>
							</ul>
						</nav>
					</div>
				</div>
			</header>
			<div className="container relative min-h-screen pb-20 mx-auto mt-24 -pt-24">
				<div className="pb-32 mb-32 space-y-4 border-b md:space-y-8 lg:space-y-16">
					<PageHeader title={url} description={<DateDisplay time={time} />} />

					{regions.length >= 2 ? (
						<div>
							<Heading h3={true}>Latency per Region</Heading>
							<div className="h-80">
								<Chart regions={regions} />
							</div>
						</div>
					) : null}
					{tags.length > 0 ? (
						<div>
							<Heading h3>Built with</Heading>
							<ul className="grid w-full grid-cols-2 gap-4 mx-auto mt-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
								{tags.map((tag) => (
									<li
										className="px-2 py-1 text-center duration-150 rounded ring-1 ring-zinc-900 hover:bg-zinc-50"
										key={tag}
									>
										{tag}
									</li>
								))}
							</ul>
						</div>
					) : null}

					<Table regions={regions} />
					<Details regions={regions} />
				</div>
			</div>
		</>
	);
}
