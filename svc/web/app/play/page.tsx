import { db } from "@planetfall/db";
import { Form } from "./dynamic";

export default async function PlayPage() {
	const regions = await db.region.findMany();

	return <Form regions={regions} />;
}
