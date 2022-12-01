import PageHeader from "@/components/page/header";
import { notFound, redirect } from "next/navigation";
import { Client as Tinybird } from "@planetfall/tinybird";

import Button from "@/components/button/button";
import { EndpointsTable } from "./table";
import { db } from "@planetfall/db";
import { getSession } from "lib/auth";
export default async function Page(props: { params: { teamSlug: string } }) {
	const session = await getSession();
	if (!session) {
		return redirect("/auth/sign-in");
	}

	const team = await db.team.findUnique({
		where: { slug: props.params.teamSlug },
		include: { endpoints: true },
	});
	if (!team) {
		console.warn(__filename, "Team not found");

		notFound();
	}

	const endpointStats = await Promise.all(
		team?.endpoints.map(async (endpoint) => {
			const stats = await new Tinybird().getEndpointStats(endpoint.id);

			return {
				id: endpoint.id,
				name: endpoint.name,
				url: endpoint.url,
				stats,
			};
		}),
	);

	return (
		<div>
			<PageHeader
				sticky={true}
				title="Endpoints"
				description="Over the last 24 hours"
				actions={[
					<Button key="new" href={`/${team.slug}/endpoints/new`}>
						New Endpoint
					</Button>,
				]}
			/>
			<main className="container mx-auto">
				<EndpointsTable endpoints={endpointStats} />
			</main>
		</div>
	);
}
