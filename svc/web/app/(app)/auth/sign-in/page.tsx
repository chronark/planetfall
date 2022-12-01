import { asyncComponent } from "lib/api/component";
import { getSession } from "lib/auth";
import { redirect } from "next/navigation";
import { Form } from "./Form";

export default asyncComponent(async () => {
	const { session } = await getSession();
	if (session) {
		return redirect("/home");
	}
	return (
		<div className="flex flex-col justify-center min-h-screen bg-gradient-to-tr from-zinc-100 to-white">
			<main className="relative flex items-center justify-center h-full">
				<Form />
			</main>
		</div>
	);
});
