import { redirect } from "next/navigation";
import { currentUser, SignIn } from "@clerk/nextjs/app-beta";
import slugify from "slugify";

export default async function SignInPage() {
	const user = await currentUser();
	if (user) {
		redirect(`/${slugify(user.username!)}`);
	}

	return (
		<div className="flex items-center justify-center">
			<SignIn />
		</div>
	);
}
