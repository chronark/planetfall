import { db } from "@planetfall/db";
import { Form } from "./dynamic";

export const revalidate = 60;

export default async function PlayPage(props: {
	searchParams?: {
		url?: string;
		method?: string;
		regions?: string;
		repeat?: string;
	};
}) {
	const regions = await db.region.findMany({where:{visible:true}});
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
