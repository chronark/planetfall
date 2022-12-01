import { db } from "@planetfall/db";
import { Form } from "./dynamic";

export default async function PlayPage(props: {
	searchParams?: {
		url?: string;
		method?: string;
		regions?: string;
		repeat?: string;
	};
}) {
	const regions = await db.region.findMany();
	console.log({ regions, props });
	return (
		<Form
			regions={regions}
			defaultValues={{
				url: props.searchParams?.url,
				method: props.searchParams?.method?.toUpperCase(),
				regions: props.searchParams?.regions?.split(","),
				repeat: props.searchParams?.repeat,
			}}
		/>
	);
}
