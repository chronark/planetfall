import PageHeader from "@/components/page/header";
import { notFound, redirect } from "next/navigation";
import { db } from "@planetfall/db";
import { Form } from "./form";
import { getSession } from "lib/auth";
import { SignIn } from "@/components/auth/sign-in";

export default async function Page(props: { params: { teamSlug: string } }) {
	const { session } = await getSession();
	if (!session) {
		return <SignIn/>;
	}

	const team = await db.team.findUnique({
		where: { slug: props.params.teamSlug },
		include: { endpoints: true },
	});
	if (!team) {
		console.warn(__filename, "Team not found");

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
