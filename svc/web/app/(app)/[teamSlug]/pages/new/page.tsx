import PageHeader from "@/components/page/header";
import { notFound, redirect } from "next/navigation";
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

	return (
		<div>
			<PageHeader
				sticky={true}
				title="Create a new Status Page"
				description={undefined}
			/>
			<div className="container mx-auto pb-20">
				<Form
					teamId={team.id}
					teamSlug={team.slug}
					endpoints={team.endpoints}
				/>
			</div>
		</div>
	);
}
