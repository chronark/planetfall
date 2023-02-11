import PageHeader from "@/components/page/header";
import { notFound, redirect } from "next/navigation";
import { db } from "@planetfall/db";
import { Form } from "./form";
import { getSession } from "lib/auth";

export default async function Page(props: { params: { teamSlug: string } }) {
	const { session } = await getSession();
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

	return (
		<div>
			<PageHeader
				sticky={true}
				title="Create a new Status Page"
				description={undefined}
			/>
			<div className="container pb-20 mx-auto">
				<Form
					teamId={team.id}
					teamSlug={team.slug}
					endpoints={team.endpoints.map((e) => ({
						id: e.id,
						name: e.name,
						url: e.url,
					}))}
				/>
			</div>
		</div>
	);
}
