import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page(props: { params: { teamSlug: string } }) {
	redirect(`/${props.params.teamSlug}/endpoints`);

	return <>Hello</>;
}
