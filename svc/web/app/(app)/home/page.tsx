import { SignIn } from "@/components/auth/sign-in";
import { db } from "@planetfall/db";
import { asyncComponent } from "lib/api/component";
import { getSession } from "lib/auth";
import { redirect } from "next/navigation";

export default asyncComponent(async () => {
	const { session } = await getSession();
	if (!session) {
		return <SignIn />;
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
	if (!team) {
		return <SignIn />;
	}
	redirect(`/${team.slug}`);
});
