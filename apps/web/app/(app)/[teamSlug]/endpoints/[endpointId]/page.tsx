import PageHeader from "@/components/page/header";
import { notFound, redirect } from "next/navigation";
import { Client as Tinybird } from "@planetfall/tinybird";

import { db } from "@planetfall/db";
import { Stats } from "@/components/stats";
import { ErrorsTable } from "./errors-table";
import { Heading } from "@/components/heading";
import { LatestTable } from "./latest-table";
import { DeleteButton } from "./delete";
import { getSession } from "lib/auth";
import { Button } from "@/components/button";
import Toggle from "./toggle";
import { Text } from "@/components/text";
import { Charts } from "./chart";
import { MultiSelect } from "@/components/multiselect";
import { ChartsSection } from "./charts-section";
import { Edu_NSW_ACT_Foundation } from "@next/font/google";
import Link from "next/link";
import { Switch } from "@/components/switch";

export const revalidate = 10;

export default async function Page(props: {
	params: { teamSlug: string; endpointId: string };
}) {
	const { session } = await getSession();
	if (!session) {
		return redirect("/auth/sign-in");
	}

	const regions = await db.region.findMany();
	const endpoint = await db.endpoint.findUnique({
		where: {
			id: props.params.endpointId,
		},
		include: {
			regions: true,
			team: {
				include: {
					members: true,
				},
			},
		},
	});
	if (!endpoint) {
		redirect(`/${props.params.teamSlug}/endpoints`);
	}

	if (
		endpoint.team.slug !== props.params.teamSlug ||
		!endpoint.team.members.find((m) => m.userId === session.user.id)
	) {
		throw new Error("Access denied");
	}

	const tb = new Tinybird();

	const [stats, latestChecks, errors, checks24h] = await Promise.all([
		tb.getEndpointStats(endpoint.id),
		tb.getLatestChecksByEndpoint(endpoint.id),
		tb.getLatestChecksByEndpoint(endpoint.id, true),
		tb.getChecks24h(endpoint.id),
	]);

	if (!stats) {
		console.warn(__filename, "Stats not found");

		return notFound();
	}
	checks24h.sort((a, b) => a.time - b.time);

	console.log({ stats, errors });
	const availability = stats.count > 0 ? 1 - errors.length / stats.count : 1;
	const degraded =
		latestChecks && latestChecks.length > 0
			? (endpoint.degradedAfter
					? latestChecks.filter(
							(d) => d.latency && d.latency >= endpoint.degradedAfter!,
					  ).length
					: 0) / latestChecks.length
			: 1;

	return (
		<div>
			<PageHeader
				sticky={true}
				title={endpoint.name}
				description={endpoint.url}
				actions={[
					<Toggle endpointId={endpoint.id} active={endpoint.active} />,
					
					<Link
						key="settings"
						href={`/${props.params.teamSlug}/endpoints/${props.params.endpointId}/settings`}
					>
						<Button variant="outline">Settings</Button>
					</Link>,
					<DeleteButton
						endpointId={endpoint.id}
						endpointName={endpoint.name}
						endpointUrl={endpoint.url}
					/>,
				]}
			/>
			<main className="container mx-auto divide-y">
				<div className="flex flex-col items-center gap-4 pb-4 md:pb-8 lg:pb-16">
					<div className="flex items-center justify-between w-full gap-2 md:gap-4 lg:gap-8">
						<Stats
							label="Availability"
							status={
								availability > 0.99
									? undefined
									: availability >= 0.95
									? "warn"
									: "error"
							}
							value={(availability * 100).toLocaleString(undefined, {
								maximumFractionDigits: 2,
							})}
							suffix="%"
						/>
						{endpoint.degradedAfter ? (
							<Stats
								label="Degraded"
								status={
									degraded <= 0.01
										? "success"
										: degraded <= 0.05
										? "warn"
										: "error"
								}
								value={(degraded * 100).toLocaleString(undefined, {
									maximumFractionDigits: 2,
								})}
								suffix="%"
							/>
						) : null}
						<Stats
							label="Errors"
							status={errors.length > 0 ? "error" : undefined}
							value={errors.length.toLocaleString()}
						/>
						<Stats
							label="P50"
							status={
								endpoint.degradedAfter
									? stats.p50 >= endpoint.degradedAfter
										? "warn"
										: undefined
									: undefined
							}
							value={stats.p50.toLocaleString()}
							suffix="ms"
						/>
						<Stats
							label="P95"
							status={
								endpoint.degradedAfter
									? stats.p95 >= endpoint.degradedAfter
										? "warn"
										: undefined
									: undefined
							}
							value={stats.p95.toLocaleString()}
							suffix="ms"
						/>
						<Stats
							label="P99"
							status={
								endpoint.degradedAfter
									? stats.p99 >= endpoint.degradedAfter
										? "warn"
										: undefined
									: undefined
							}
							value={stats.p99.toLocaleString()}
							suffix="ms"
						/>
					</div>
					<Text color="text-zinc-500" size="xs">
						{" "}
						Metrics are aggregated over the past 24h
					</Text>
				</div>

				{/* {errors.length > 0 ? (
					<div className="py-4 md:py-8 lg:py-16">
						<Heading h3={true}>Errors</Heading>
						<ErrorsTable errors={errors} />
					</div>
				) : null} */}

				{latestChecks.length > 0 ? (
					<div className="py-4 md:py-8 lg:py-16">
						<ChartsSection
							checks={checks24h}
							endpoint={{
								timeout: endpoint.timeout,
								degradedAfter: endpoint.degradedAfter,
								regions: endpoint.regions,
							}}
						/>
					</div>
				) : null}

				{latestChecks.length > 0 ? (
					<div className="py-4 md:py-8 lg:py-16">
						<Heading h3={true}>Latest Checks</Heading>
						<LatestTable
							endpointId={props.params.endpointId}
							teamSlug={props.params.teamSlug}
							checks={latestChecks}
							degradedAfter={endpoint.degradedAfter}
							timeout={endpoint.timeout}
							regions={regions}
						/>
					</div>
				) : null}
			</main>
		</div>
	);
}
