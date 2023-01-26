import PageHeader from "@/components/page/header";
import { notFound, redirect } from "next/navigation";
import { Client as Tinybird } from "@planetfall/tinybird";

import { Button } from "@/components/button";
import { StatuspagesTable } from "./table";
import { db } from "@planetfall/db";
import { getSession } from "lib/auth";
import Link from "next/link";
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
				<StatuspagesTable teamSlug={props.params.teamSlug} pages={team.pages} />
			</main>
		</div>
	);
}
