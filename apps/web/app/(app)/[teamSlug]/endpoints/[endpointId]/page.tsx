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
import { ChartsSection } from "./chart-by-region";
import { Edu_NSW_ACT_Foundation } from "@next/font/google";
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

	const regions = await db.region.findMany({where:{visible:true}});
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

	const [stats, checks, statsByRegion] = await Promise.all([
		tb.getEndpointStats(endpoint.id),
		tb.getLatestChecksByEndpoint(endpoint.id, { limit: 10000 }),
		tb.getEndpointStatsPerRegion(endpoint.id),
	]);

	if (!stats) {
		console.warn(__filename, "Stats not found");

		return notFound();
	}
	const errors = checks.filter((c) => Boolean(c.error));

	const availability = stats.count > 0 ? 1 - errors.length / stats.count : 1;
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
						<Button variant="outline">Settings</Button>
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
						<div className="grid w-full grid-cols-3 gap-2 lg:grid-cols-6 md:gap-4 lg:gap-8">
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
								value={stats.p50.toLocaleString()}
								suffix="ms"
								status={
									endpoint.timeout && stats.p50 > endpoint.timeout
										? "error"
										: endpoint.degradedAfter &&
										  stats.p50 > endpoint.degradedAfter
										? "warn"
										: undefined
								}
							/>
							<Stats
								label="P95"
								value={stats.p95.toLocaleString()}
								suffix="ms"
								status={
									endpoint.timeout && stats.p95 > endpoint.timeout
										? "error"
										: endpoint.degradedAfter &&
										  stats.p95 > endpoint.degradedAfter
										? "warn"
										: undefined
								}
							/>
							<Stats
								label="P99"
								value={stats.p99.toLocaleString()}
								suffix="ms"
								status={
									endpoint.timeout && stats.p99 > endpoint.timeout
										? "error"
										: endpoint.degradedAfter &&
										  stats.p99 > endpoint.degradedAfter
										? "warn"
										: undefined
								}
							/>
						</div>
					</div>
				</div>

				{/* {errors.length > 0 ? (
					<div className="py-4 md:py-8 lg:py-16">
						<Heading h3={true}>Errors</Heading>
						<ErrorsTable errors={errors} />
					</div>
				) : null} */}
				{checks.length > 0 ? (
					<>
						<Chart
							regions={statsByRegion.map((region) => ({
								...region,
								region:
									regions.find((r) => r.id === region.regionId)?.name ??
									region.regionId,
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
									regions={regions}
								/>
							</CardContent>
						</Card>
					</>
				) : null}
			</main>
		</div>
	);
}
