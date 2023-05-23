import { redirect } from "next/navigation";

export default async function Page(props: { params: { teamSlug: string } }) {
  return redirect(`/${props.params.teamSlug}/endpoints`);
}
