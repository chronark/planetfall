import PageHeader from "@/components/page/header";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { notFound, redirect } from "next/navigation";
import { Client as Tinybird } from "@planetfall/tinybird";

import Button from "@/components/button/button";
import { StatuspagesTable } from "./table";
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
		include: { pages: { include: { endpoints: true } } },
	});
	if (!team) {
		notFound();
	}

	return (
		<div>
			<PageHeader
				sticky={true}
				title="Status Pages"
				description=""
				actions={[
					<Button key="new" href={`/${team.slug}/pages/new`}>
						New Status Page
					</Button>,
				]}
			/>
			<main className="container mx-auto">
				<StatuspagesTable teamSlug={props.params.teamSlug} pages={team.pages} />
			</main>
		</div>
	);
}
