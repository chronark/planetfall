import { redirect } from "next/navigation";

export default async function Page(props: {
  params: { teamSlug: string };
}) {
  redirect(`/${props.params.teamSlug}/endpoints`);

  return <div>A</div>;
}
