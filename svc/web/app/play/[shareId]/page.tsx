import { Heading } from "@/components/heading";
import PageHeader from "@/components/page/header";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Redis } from "@upstash/redis";
// @ts-ignore
import type { Input } from "pages/api/v1/checks/share";
import { Chart } from "./chart";
import { Details } from "./details";

export const revalidate = 60;

const redis = Redis.fromEnv();
export default async function Share(props: { params: { shareId: string } }) {
	const res = await redis.get<Input["body"]>(
		["play", props.params.shareId].join(":"),
	);
	if (!res) {
		return notFound();
	}

	const { checks, url } = res;
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
			<div className="container min-h-screen pb-20 mx-auto mt-24 -pt-24">
				<div className="pb-32 mb-32 border-b">
					<PageHeader title={url} />

					{checks.length >= 2 ? (
						<>
							<Heading h3={true}>Latency per Region</Heading>
							<Chart checks={checks} />
						</>
					) : null}

					<div className="py-4 md:py-8 lg:py-16">
						{checks.length >= 2 ? (
							<PageHeader
								title="Details"
								description="A detailed breakdown by region, including the response and a latency trace"
							/>
						) : null}

						<Details checks={checks} />
					</div>
				</div>
			</div>
		</>
	);
}
