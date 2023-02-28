import { getSession } from "@/lib/auth";
import { db } from "@planetfall/db";
import { Form } from "./dynamic";

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function PlayPage(props: {
	searchParams?: {
		url?: string;
		method?: string;
		regions?: string;
		repeat?: string;
	};
}) {
	const { session } = await getSession();

	const regions = session
		? await db.region.findMany({ where: { visible: true } })
		: await db.region.findMany({
				where: { visible: true, platform: "vercelEdge" },
		  });
	return (
		<Form
			regions={regions}
			defaultValues={{
				url: props.searchParams?.url,
				method: props.searchParams?.method?.toUpperCase(),
				regions: props.searchParams?.regions?.split(","),
			}}
		/>
	);
}
