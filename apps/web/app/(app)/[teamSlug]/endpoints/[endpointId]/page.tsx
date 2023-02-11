import PageHeader from "@/components/page/header";
import { notFound, redirect } from "next/navigation";
import { Client as Tinybird } from "@planetfall/tinybird";

import { db } from "@planetfall/db";
import { Stats } from "@/components/stats";
import { ErrorsTable } from "./errors/table";
import { Heading } from "@/components/heading";
import { LatestTable } from "./latest-table";
import { DeleteButton } from "./delete";
import { getSession } from "lib/auth";
import { Button } from "@/components/button";
import { Toggle } from "./toggle";
import { Text } from "@/components/text";
import { ChartsSection } from "./chart-by-region";
import Link from "next/link";
import { Switch } from "@/components/switch";
import { Chart } from "./chart";
import {
	Card,
	CardContent,
	CardFooter,
	CardFooterStatus,
	CardHeader,
	CardHeaderTitle,
} from "@/components/card";
import { Divider } from "@/components/divider";

export const revalidate = 10;

export default async function Page(props: {
	params: { teamSlug: string; endpointId: string };
}) {
	const { session } = await getSession();
	if (!session) {
		return redirect("/auth/sign-in");
	}

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

	const [stats, checks] = await Promise.all([
		tb.getEndpointStats(endpoint.id),
		tb.getLatestChecksByEndpoint(endpoint.id, { limit: 10000 }),
	]);

	if (!stats) {
		console.warn(__filename, "Stats not found");

		return notFound();
	}
	const globalStats = stats.find((s) => s.regionId === "global");
	if (!globalStats) {
		console.warn(__filename, "Global stats not found");

		return notFound();
	}
	const errors = checks
		.filter((c) => Boolean(c.error))
		.map((e) => ({
			id: e.id,
			time: e.time,
			error: e.error!,
			latency: e.latency,
			region: endpoint.regions.find((r) => r.id === e.regionId)!.name,
		}));

	const availability =
		globalStats.count > 0 ? 1 - errors.length / globalStats.count : 1;
	const degraded =
		checks && checks.length > 0
			? (endpoint.degradedAfter
					? checks.filter(
							(d) => d.latency && d.latency >= endpoint.degradedAfter!,
					  ).length
					: 0) / checks.length
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
						<Button>Settings</Button>
					</Link>,
					<DeleteButton
						endpointId={endpoint.id}
						endpointName={endpoint.name}
						endpointUrl={endpoint.url}
					/>,
				]}
			/>
			<main className="container mx-auto">
				<div className="pt-2 mb-4 md:pt-4 lg:pt-8 md:mb-8 lg:mb-16">
					<div>
						<div className="w-full grid grid-cols-3 gap-2 lg:grid-cols-6 md:gap-4 lg:gap-8">
							<Stats
								label="Availability"
								value={(availability * 100).toLocaleString(undefined, {
									maximumFractionDigits: 2,
								})}
								suffix="%"
							/>
							{endpoint.degradedAfter ? (
								<Stats
									label="Degraded"
									value={(degraded * 100).toLocaleString(undefined, {
										maximumFractionDigits: 2,
									})}
									suffix="%"
									status={degraded > 0 ? "warn" : undefined}
								/>
							) : null}
							<Stats label="Errors" value={errors.length.toLocaleString()} />
							<Stats
								label="P50"
								value={globalStats.p50.toLocaleString()}
								suffix="ms"
								status={
									endpoint.timeout && globalStats.p50 > endpoint.timeout
										? "error"
										: endpoint.degradedAfter &&
										  globalStats.p50 > endpoint.degradedAfter
										? "warn"
										: undefined
								}
							/>
							<Stats
								label="P95"
								value={globalStats.p95.toLocaleString()}
								suffix="ms"
								status={
									endpoint.timeout && globalStats.p95 > endpoint.timeout
										? "error"
										: endpoint.degradedAfter &&
										  globalStats.p95 > endpoint.degradedAfter
										? "warn"
										: undefined
								}
							/>
							<Stats
								label="P99"
								value={globalStats.p99.toLocaleString()}
								suffix="ms"
								status={
									endpoint.timeout && globalStats.p99 > endpoint.timeout
										? "error"
										: endpoint.degradedAfter &&
										  globalStats.p99 > endpoint.degradedAfter
										? "warn"
										: undefined
								}
							/>
						</div>
					</div>
				</div>

				{errors.length > 0 ? (
					<>
						<Card>
							<CardHeader>
								<CardHeaderTitle
									title="Errors"
									subtitle={`There have been ${errors.length} errors in the last 24 hours.`}
								/>
								<Button>
									<Link
										href={`/${props.params.teamSlug}/endpoints/${props.params.endpointId}/errors`}
									>
										Go to Errors
									</Link>
								</Button>
							</CardHeader>
						</Card>
						<Divider />
					</>
				) : null}
				{checks.length > 0 ? (
					<>
						<Chart
							regions={stats.map((region) => ({
								...region,
								region:
									endpoint.regions.find((r) => r.id === region.regionId)
										?.name ?? region.regionId,
							}))}
							endpoint={{
								timeout: endpoint.timeout ?? undefined,
								degradedAfter: endpoint.degradedAfter ?? undefined,
							}}
						/>
						<Divider />
					</>
				) : null}
				{checks.length > 0 ? (
					<>
						<ChartsSection
							checks={checks}
							endpoint={{
								timeout: endpoint.timeout,
								degradedAfter: endpoint.degradedAfter,
								regions: endpoint.regions,
							}}
						/>
						<Divider />
					</>
				) : null}

				{checks.length > 0 ? (
					<>
						<Card>
							<CardHeader>
								<CardHeaderTitle title="Latest Checks" />
							</CardHeader>
							<CardContent>
								<LatestTable
									endpointId={props.params.endpointId}
									teamSlug={props.params.teamSlug}
									checks={checks.slice(0, 10)}
									degradedAfter={endpoint.degradedAfter}
									timeout={endpoint.timeout}
									regions={endpoint.regions}
								/>
							</CardContent>
						</Card>
					</>
				) : null}
			</main>
		</div>
	);
}
