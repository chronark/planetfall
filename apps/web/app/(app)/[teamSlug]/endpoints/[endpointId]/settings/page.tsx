import { db } from "@planetfall/db";
import { notFound } from "next/navigation";
import { Form } from "./form";

export default async function Page(props: {
	params: { teamSlug: string; endpointId: string };
}) {
	const endpoint = await db.endpoint.findUnique({
		where: { id: props.params.endpointId },
		include: { regions: true },
	});
	if (!endpoint) {
		return notFound();
	}

	const regions = await db.region.findMany({ where: { visible: true } });

	/**
	 * Date is not serializable between server and client
	 */
	const e = {
		...endpoint,
		updatedAt: undefined,
		createdAt: undefined,
	};
	return (
		<Form endpoint={e} regions={regions} teamSlug={props.params.teamSlug} />
	);
}
