import PageHeader from "@/components/page/header";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { notFound, redirect } from "next/navigation";
import { Client as Tinybird } from "@planetfall/tinybird";

import Button from "@/components/button/button";
import { EndpointsTable } from "../table";
import { currentUser } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
import { Form } from "./form";

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

	const regions = await db.region.findMany();

	return (
		<div>
			<PageHeader
				sticky={true}
				title="Create a new endpoint"
				description={undefined}
			/>
			<div className="container mx-auto pb-20">
				<Form teamId={team.id} teamSlug={team.slug} regions={regions} />
			</div>
		</div>
	);
}
