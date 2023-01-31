import PageHeader from "@/components/page/header";
import { notFound, redirect } from "next/navigation";
import { Client as Tinybird } from "@planetfall/tinybird";

import { Button } from "@/components/button";
import { EndpointsTable } from "./table";
import { db } from "@planetfall/db";
import { getSession } from "lib/auth";
import Link from "next/link";
import { Card, CardContent } from "@/components/card";
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
				description="Aggregated over the last 24 hours"
				actions={[
					<Link key="new" href={`/${team.slug}/endpoints/new`}>
						<Button>New Endpoint</Button>
					</Link>,
				]}
			/>
			<main className="container mx-auto">
				<Card>
					<CardContent>
						<EndpointsTable endpoints={endpointStats} />
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
