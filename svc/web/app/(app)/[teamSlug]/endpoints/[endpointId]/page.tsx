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
import Button from "@/components/button/button";
import Toggle from "./toggle";

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

	const [stats, latestChecks, errors] = await Promise.all([
		tb.getEndpointStats(endpoint.id),
		tb.getLatestChecksByEndpoint(endpoint.id),
		tb.getLatestChecksByEndpoint(endpoint.id, true),
	]);

	if (!stats) {
		console.warn(__filename, "Stats not found");

		return notFound();
	}

	const availability = stats.count > 0 ? 1 - errors.length / stats.count : 1;
	const degraded = 0; //checks.data
	//   ? (endpoint.data?.degradedAfter
	//     ? (checks.data ?? []).filter((d) =>
	//       d.latency && d.latency >= endpoint.data.degradedAfter!
	//     ).length
	//     : 0) / checks.data.length
	//   : 1;

	return (
		<div>
			<PageHeader
				sticky={true}
				title={endpoint.name}
				description={endpoint.url}
				actions={[
					<Toggle endpointId={endpoint.id} active={endpoint.active} />,

					<Button
						key="settings"
						type="secondary"
						href={`/${props.params.teamSlug}/endpoints/${props.params.endpointId}/settings`}
					>
						Settings
					</Button>,

					<DeleteButton
						endpointId={endpoint.id}
						endpointName={endpoint.name}
						endpointUrl={endpoint.url}
					/>,
				]}
			/>
			<main className="container mx-auto divide-y">
				<div className="flex items-center justify-between w-full gap-2 pb-4 md:gap-4 lg:gap-8 md:pb-8 lg:pb-16">
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

				{errors.length > 0 ? (
					<div className="py-4 md:py-8 lg:py-16">
						<Heading h3={true}>Errors</Heading>
						<ErrorsTable errors={errors} />
					</div>
				) : null}

				{latestChecks.length > 0 ? (
					<div className="py-4 md:py-8 lg:py-16">
						<Heading h3={true}>Latest Checks</Heading>
						<LatestTable
							endpointId={props.params.endpointId}
							teamSlug={props.params.teamSlug}
							checks={latestChecks}
						/>
					</div>
				) : null}
			</main>
		</div>
	);
}
