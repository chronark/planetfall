import { auth, currentUser, clerkClient } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
import { asyncComponent } from "lib/api/component";
import { redirect } from "next/navigation";
import { useImperativeHandle } from "react";
import slugify from "slugify";

export default asyncComponent(async () => {
	const { userId } = auth();
	if (!userId) {
		redirect("/auth/sign-in");
	}
	const team = await db.team.findFirst({
		where: {
			isPersonal: true,
			members: {
				some: {
					userId,
				},
			},
		},
	});
	if (!team) {
		redirect("/auth/sign-in");
	}
	redirect(`/${team.slug}`);
});
