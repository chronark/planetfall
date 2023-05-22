import { Form } from "./form";
import PageHeader from "@/components/page/header";
import { auth } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
import { notFound, redirect } from "next/navigation";

export default async function Page(props: { params: { teamSlug: string } }) {
  const { userId } = auth();
  if (!userId) {
    return redirect("/auth/sign-in");
  }

  const team = await db.team.findUnique({
    where: { slug: props.params.teamSlug },
    include: { endpoints: true, members: true },
  });
  if (!team) {
    console.warn(__filename, "Team not found");

    return notFound();
  }

  if (!team.members.find((m) => m.userId === userId)) {
    return notFound();
  }

  return (
    <div>
      <PageHeader sticky={true} title="Create a new Status Page" description={undefined} />
      <div className="container pb-20 mx-auto">
        <Form
          teamId={team.id}
          teamSlug={team.slug}
          endpoints={team.endpoints.map((e) => ({
            id: e.id,
            name: e.name,
            url: e.url,
          }))}
        />
      </div>
    </div>
  );
}
