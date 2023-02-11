import PageHeader from "@/components/page/header";
import { notFound, redirect } from "next/navigation";
import { Client as Tinybird } from "@planetfall/tinybird";

import { Button } from "@/components/button";
import { StatuspagesTable } from "./table";
import { db } from "@planetfall/db";
import { getSession } from "lib/auth";
import Link from "next/link";
import { Card, CardContent } from "@/components/card";
import { Text } from "@/components/text";
import { Plus } from "lucide-react";
export default async function Page(props: { params: { teamSlug: string } }) {
	const session = await getSession();
	if (!session) {
		return redirect("/auth/sign-in");
	}

	const team = await db.team.findUnique({
		where: { slug: props.params.teamSlug },
		include: { pages: { include: { endpoints: true } } },
	});
	if (!team) {
		console.warn(__filename, "Team not found");

		notFound();
	}

	return (
		<div>
			<PageHeader
				sticky={true}
				title="Status Pages"
				description=""
				actions={[
					<Link key="new" href={`/${team.slug}/pages/new`}>
						<Button>New Status Page</Button>
					</Link>,
				]}
			/>
			<main className="container mx-auto">
				{team.pages.length === 0 ? (
					<div className="flex flex-col items-center justify-center max-w-sm p-4 mx-auto md:p-8">
						<Text>You don't have any status pages yet.</Text>
						<Button size="lg" className="flex items-center mt-2 gap-2 ">
							<Plus className="w-5 h-5" />
							<Link href={`/${team.slug}/pages/new`}>
								Create your first page
							</Link>
						</Button>
					</div>
				) : (
					<Card>
						<CardContent>
							<StatuspagesTable
								teamSlug={props.params.teamSlug}
								pages={team.pages.map((page) => ({
									id: page.id,
									name: page.name,
									slug: page.slug,
									endpoints: page.endpoints.map((endpoint) => ({
										id: endpoint.id,
										name: endpoint.name,
									})),
								}))}
							/>
						</CardContent>
					</Card>
				)}
			</main>
		</div>
	);
}
