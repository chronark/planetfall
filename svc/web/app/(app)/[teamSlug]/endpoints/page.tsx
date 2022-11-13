import PageHeader from "@/components/page/header";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { notFound, redirect } from "next/navigation";
import { Client as Tinybird } from "@planetfall/tinybird";

import Button from "@/components/button/button";
import { EndpointsTable } from "./table";
import { currentUser } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
export default async function Page(props: { params: { teamSlug: string } }) {
	const user = await currentUser();
	if (!user) {
		redirect("/auth/sign-in");
		return;
	}

	const team = await db.team.findUnique({
		where: { slug: props.params.teamSlug },
		include: { endpoints: true },
	});
	if (!team) {
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
