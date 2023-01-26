import PageHeader from "@/components/page/header";
import { notFound, redirect } from "next/navigation";
import { Client as Tinybird } from "@planetfall/tinybird";

import { Button } from "@/components/button";
import { db } from "@planetfall/db";
import { Stats } from "@/components/stats";
import { Heading } from "@/components/heading";
import ms from "ms";
import { CheckIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { Text } from "@/components/text";
import { HeaderTable } from "./header-table";
import { getSession } from "lib/auth";
import Link from "next/link";

type Timings = {
	dnsStart: number;
	dnsDone: number;
	connectStart: number;
	connectDone: number;
	tlsHandshakeStart: number;
	tlsHandshakeDone: number;
	firstByteStart: number;
	firstByteDone: number;
	transferStart: number;
	transferDone: number;
};

const DNS: React.FC<{ timings: Timings }> = ({ timings }): JSX.Element => {
	const start = Math.min(...Object.values(timings).filter((t) => t > 0));
	const end = Math.max(...Object.values(timings).filter((t) => t > 0));

	return (
		<div className="transition-all duration-500">
			{timings.dnsDone > 0 ? (
				<div className="flex items-center w-full gap-4 py-1 duration-500 rounded hover:bg-zinc-100">
					<div className="flex justify-between w-1/5 text-sm text-zinc-500 whitespace-nowrap ">
						<span>DNS</span>
						<span>
							{(timings.dnsDone - timings.dnsStart).toLocaleString()} ms
						</span>
					</div>
					<div className="flex w-4/5">
						<div
							style={{
								width: `${
									(Math.max(1, timings.dnsDone - timings.dnsStart) /
										(end - start)) *
									100
								}%`,
							}}
						>
							<div className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded-sm" />
						</div>
					</div>
				</div>
			) : null}

			{timings.connectDone > 0 ? (
				<div className="flex items-center w-full gap-4 py-1 duration-500 rounded hover:bg-zinc-100">
					<div className="flex justify-between w-1/5 text-sm text-zinc-500 whitespace-nowrap ">
						<span>Connection</span>
						<span>
							{(timings.connectDone - timings.connectStart).toLocaleString()} ms
						</span>
					</div>
					<div className="flex w-4/5">
						<div
							style={{
								width: `${
									((timings.connectStart - start) / (end - start)) * 100
								}%`,
							}}
						/>
						<div
							style={{
								width: `${
									(Math.max(1, timings.connectDone - timings.connectStart) /
										(end - start)) *
									100
								}%`,
							}}
						>
							<div className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded-sm" />
						</div>
					</div>
				</div>
			) : null}
			{timings.tlsHandshakeDone > 0 ? (
				<div className="flex items-center w-full gap-4 py-1 duration-500 rounded hover:bg-zinc-100">
					<div className="flex justify-between w-1/5 text-sm text-zinc-500 whitespace-nowrap ">
						<span>TLS</span>
						<span>
							{(
								timings.tlsHandshakeDone - timings.tlsHandshakeStart
							).toLocaleString()}{" "}
							ms
						</span>
					</div>
					<div className="flex w-4/5">
						<div
							style={{
								width: `${
									((timings.tlsHandshakeStart - start) / (end - start)) * 100
								}%`,
							}}
						/>
						<div
							style={{
								width: `${
									(Math.max(
										1,
										timings.tlsHandshakeDone - timings.tlsHandshakeStart,
									) /
										(end - start)) *
									100
								}%`,
							}}
						>
							<div className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded-sm" />
						</div>
					</div>
				</div>
			) : null}
			{timings.firstByteDone > 0 ? (
				<div className="flex items-center w-full gap-4 py-1 duration-500 rounded hover:bg-zinc-100">
					<div className="flex justify-between w-1/5 text-sm text-zinc-500 whitespace-nowrap ">
						<span>Waiting for response</span>
						<span>
							{(
								timings.firstByteDone - timings.firstByteStart
							).toLocaleString()}{" "}
							ms
						</span>
					</div>
					<div className="flex w-4/5">
						<div
							style={{
								width: `${
									((timings.firstByteStart - start) / (end - start)) * 100
								}%`,
							}}
						/>
						<div
							style={{
								width: `${
									(Math.max(1, timings.firstByteDone - timings.firstByteStart) /
										(end - start)) *
									100
								}%`,
							}}
						>
							<div className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded-sm" />
						</div>
					</div>
				</div>
			) : null}
			{timings.transferDone > 0 ? (
				<div className="flex items-center w-full gap-4 py-1 duration-500 rounded hover:bg-zinc-100">
					<div className="flex justify-between w-1/5 text-sm text-zinc-500 whitespace-nowrap ">
						<span>Transfer</span>
						<span>
							{(timings.transferDone - timings.transferStart).toLocaleString()}{" "}
							ms
						</span>
					</div>
					<div className="flex w-4/5">
						<div
							style={{
								width: `${
									((timings.transferStart - start) / (end - start)) * 100
								}%`,
							}}
						/>
						<div
							style={{
								width: `${
									(Math.max(1, timings.transferDone - timings.transferStart) /
										(end - start)) *
									100
								}%`,
							}}
						>
							<div className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded-sm" />
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
};

export default async function Page(props: {
	params: { teamSlug: string; checkId: string };
}) {
	const check = await new Tinybird().getCheckById(props.params.checkId);

	if (!check) {
		console.warn(__filename, "User not found");
		notFound();
		return;
	}

	const session = await getSession();
	if (!session) {
		return redirect("/auth/sign-in");
	}

	const endpoint = check.endpointId
		? await db.endpoint.findUnique({ where: { id: check.endpointId } })
		: null;

	const regions = await db.region.findMany();

	const playParams = new URLSearchParams([
		["url", endpoint!.url],
		["regions", check.regionId],
		["method", endpoint!.method],
	]);

	return (
		<div>
			<PageHeader
				sticky={true}
				title={check.id}
				description={endpoint?.url}
				actions={[
					<Link href={`/play?${playParams.toString()}`} target="_blank">
						<Button key="play">Open in playground</Button>,
					</Link>,
				]}
			/>
			<main className="container mx-auto divide-y">
				<div className="flex items-center justify-between w-full gap-2 md:gap-4 lg:gap-8">
					<Stats
						label={check.error ? "Error" : "Success"}
						value={
							check.error ? (
								<ExclamationCircleIcon className="w-8 h-8 m-1" />
							) : (
								<CheckIcon className="w-8 h-8 m-1" />
							)
						}
						status={check.error ? "error" : "success"}
					/>
					<Stats
						label={new Date(check.time).toLocaleString() ?? ""}
						value={`${
							check.time ? ms(Date.now() - new Date(check.time).getTime()) : ""
						}`}
						suffix="ago"
					/>
					<Stats label="Status" value={check.status?.toString() ?? "None"} />
					<Stats
						label="Latency"
						value={check.latency?.toLocaleString() ?? "None"}
						status={
							endpoint?.degradedAfter &&
							check.latency &&
							check.latency >= endpoint.degradedAfter
								? "warn"
								: undefined
						}
						suffix="ms"
					/>
					<Stats
						label="Region"
						value={regions.find((r) => r.id === check.regionId)?.name ?? "X"}
					/>
				</div>

				{check.timing ? (
					<div className="flex flex-col py-4 space-y-4 md:py-8 lg:py-16">
						<Heading h2={true}>Trace</Heading>

						<DNS timings={JSON.parse(check.timing) as Timings} />
					</div>
				) : null}
				{check.error ? (
					<div className="flex flex-col py-4 space-y-4 md:py-8 lg:py-16">
						<Heading h2={true}>Error</Heading>

						<Text>{check.error}</Text>
					</div>
				) : null}

				{check.header ? (
					<div className="flex flex-col py-4 space-y-4 md:py-8 lg:py-16">
						<Heading h2={true}>Response Header</Heading>

						<HeaderTable
							header={Object.entries(
								JSON.parse(check.header) as Record<string, string>,
							).map(([key, value]) => ({ key, value }))}
						/>
					</div>
				) : null}
				{check.body ? (
					<div className="flex flex-col py-4 space-y-4 md:py-8 lg:py-16">
						<Heading h2={true}>Response Body</Heading>

						<code className="flex flex-grow w-full px-2 py-1 border rounded md:px-4 md:py-3 ">
							{atob(check.body)}
						</code>
					</div>
				) : null}
			</main>
		</div>
	);
}
