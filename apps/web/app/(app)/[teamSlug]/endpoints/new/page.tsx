import PageHeader from "@/components/page/header";
import { notFound, redirect } from "next/navigation";
import { db } from "@planetfall/db";
import { Form } from "./form";
import { currentUser } from "@clerk/nextjs/app-beta";

export default async function Page(props: { params: { teamSlug: string } }) {
    const user =await currentUser();
  if(!user){
    return redirect("/auth/sign-in");
  }

  const team = await db.team.findUnique({
    where: { slug: props.params.teamSlug },
    include: { endpoints: true },
  });
  if (!team) {
    console.warn(__filename, "Team not found");

    notFound();
  }

  const regions = await db.region.findMany({ where: { visible: true } });

  return (
    <div>
      <PageHeader sticky={true} title="Create a new endpoint" description={undefined} />
      <div className="container pb-20 mx-auto">
        <Form
          teamId={team.id}
          teamSlug={team.slug}
          regions={regions}
          defaultTimeout={team.maxTimeout}
        />
      </div>
    </div>
  );
}
