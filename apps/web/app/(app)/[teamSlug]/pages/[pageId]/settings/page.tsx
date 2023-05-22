import { Form } from "./form";
import PageHeader from "@/components/page/header";
import { auth } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
import { notFound, redirect } from "next/navigation";

export default async function Page(props: {
  params: { teamSlug: string; pageId: string };
}) {
  const { userId } = auth();
  if (!userId) {
    return redirect("/auth/sign-in");
  }

  const team =await db.team.findUnique({
    where: { slug: props.params.teamSlug },
    include: { endpoints: true },
  });
  if (!team) {
    return notFound();
  }
  const page =await db.statusPage.findUnique({
    where: { id: props.params.pageId },
    include: {
      endpoints: true,
    },
  });
  if (!page) {
    return notFound();
  }
  if (page.teamId !== team.id) {
    return notFound();
  }

  return (
    <div>
      <PageHeader sticky={true} title={page.name} description={`${page.slug}.planetfall.io`} />
      <div className="container pb-20 mx-auto">
        <Form
          teamSlug={props.params.teamSlug}
          page={{
            id: page.id,
            name: page.name,
            slug: page.slug,
            endpointIds: page.endpoints.map((endpoint) => endpoint.id),
          }}
          endpoints={team.endpoints.map((endpoint) => ({
            id: endpoint.id,
            name: endpoint.name,
            url: endpoint.url,
          }))}
        />
      </div>
    </div>
  );
}
