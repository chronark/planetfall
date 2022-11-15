import { getSession } from "lib/auth";
import { redirect } from "next/navigation";
import { Form } from "./form";

export default async function SignInPage() {
	const session = await getSession();
	if (session) {
		redirect("/home");
	}

	return (
		<div className="flex items-center justify-center">
			<Form />
		</div>
	);
}
