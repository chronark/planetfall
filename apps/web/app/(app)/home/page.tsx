import { db } from "@planetfall/db";
import { getSession } from "lib/auth";
import { notFound, redirect } from "next/navigation";

export default async function Home() {
	const { session } = await getSession();
	if (!session) {
		return redirect("/auth/sign-in");
	}

	const team = await db.team.findFirst({
		where: {
			isPersonal: true,
			members: {
				some: {
					userId: session.user.id,
				},
			},
		},
	});

	console.log({ session,team });
	if (!team) {
		notFound();
	}
	redirect(`/${team.slug}`);
}
