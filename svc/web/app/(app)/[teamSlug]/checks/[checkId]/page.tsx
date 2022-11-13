import PageHeader from "@/components/page/header";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { notFound, redirect } from "next/navigation";
import { Client as Tinybird } from "@planetfall/tinybird";

import Button from "@/components/button/button";
import { currentUser } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
import { Stats } from "@/components/stats";
import { Heading } from "@/components/heading";
import ms from "ms";
import { CheckIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { Text } from "@/components/text";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { HeaderTable } from "./header-table";
// import Confirm from "@/components/confirm/confirm";

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
				<div className="flex w-full gap-4 items-center py-1 duration-500 hover:bg-slate-100 rounded">
					<div className="w-1/5 flex text-sm text-slate-500 justify-between whitespace-nowrap ">
						<span>DNS</span>
						<span>
							{(timings.dnsDone - timings.dnsStart).toLocaleString()} ms
						</span>
					</div>
					<div className="w-4/5 flex">
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
				<div className="flex w-full gap-4 items-center py-1 duration-500 hover:bg-slate-100 rounded">
					<div className="w-1/5 flex text-sm text-slate-500 justify-between whitespace-nowrap ">
						<span>Connection</span>
						<span>
							{(timings.connectDone - timings.connectStart).toLocaleString()} ms
						</span>
					</div>
					<div className="w-4/5 flex">
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
				<div className="flex w-full gap-4 items-center py-1 duration-500 hover:bg-slate-100 rounded">
					<div className="w-1/5 flex text-sm text-slate-500 justify-between whitespace-nowrap ">
						<span>TLS</span>
						<span>
							{(
								timings.tlsHandshakeDone - timings.tlsHandshakeStart
							).toLocaleString()}{" "}
							ms
						</span>
					</div>
					<div className="w-4/5 flex">
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
				<div className="flex w-full gap-4 items-center py-1 duration-500 hover:bg-slate-100 rounded">
					<div className="w-1/5 flex text-sm text-slate-500 justify-between whitespace-nowrap ">
						<span>Waiting for response</span>
						<span>
							{(
								timings.firstByteDone - timings.firstByteStart
							).toLocaleString()}{" "}
							ms
						</span>
					</div>
					<div className="w-4/5 flex">
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
				<div className="flex w-full gap-4 items-center py-1 duration-500 hover:bg-slate-100 rounded">
					<div className="w-1/5 flex text-sm text-slate-500 justify-between whitespace-nowrap ">
						<span>Transfer</span>
						<span>
							{(timings.transferDone - timings.transferStart).toLocaleString()}{" "}
							ms
						</span>
					</div>
					<div className="w-4/5 flex">
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
		notFound();
		return;
	}

	const user = await currentUser();
	if (!user) {
		redirect("/auth/sign-in");
		return;
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
					<Button
						key="play"
						href={`/play?${playParams.toString()}`}
						newTab={true}
					>
						Open in playground
					</Button>,
				]}
			/>
			<main className="container mx-auto divide-y">
				<div className="w-full flex justify-between items-center gap-2 md:gap-4 lg:gap-8">
					<Stats
						label={check.error ? "Error" : "Success"}
						value={
							check.error ? (
								<ExclamationCircleIcon className="m-1 w-8 h-8" />
							) : (
								<CheckIcon className="m-1 w-8 h-8" />
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
					<div className="py-4 md:py-8 lg:py-16 flex flex-col space-y-4">
						<Heading h2={true}>Trace</Heading>

						<DNS timings={JSON.parse(check.timing) as Timings} />
					</div>
				) : null}
				{check.error ? (
					<div className="py-4 md:py-8 lg:py-16  flex flex-col space-y-4">
						<Heading h2={true}>Error</Heading>

						<Text>{check.error}</Text>
					</div>
				) : null}

				<div className="py-4 md:py-8 lg:py-16 flex flex-col space-y-4">
					<Heading h2={true}>Response Header</Heading>

					<HeaderTable
						header={Object.entries(
							JSON.parse(check.header) as Record<string, string>,
						).map(([key, value]) => ({ key, value }))}
					/>
				</div>
				{check.body ? (
					<div className="py-4 md:py-8 lg:py-16 flex flex-col space-y-4">
						<Heading h2={true}>Response Body</Heading>

						<code className="md:px-4 px-2 py-1 md:py-3  w-full flex flex-grow  border rounded">
							{atob(check.body)}
						</code>
					</div>
				) : null}
			</main>
		</div>
	);
}
