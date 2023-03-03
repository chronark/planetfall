import PageHeader from "@/components/page/header";
import { notFound, redirect } from "next/navigation";
import { db } from "@planetfall/db";
import { Form } from "./form";
import { currentUser } from "@clerk/nextjs/app-beta";

export default async function Page(props: {
  params: { teamSlug: string; pageId: string };
}) {
  const user = await currentUser();
  if (!user) {
    return redirect("/auth/sign-in");
  }

  const team = await db.team.findUnique({
    where: { slug: props.params.teamSlug },
    include: { endpoints: true },
  });
  if (!team) {
    return notFound();
  }
  const page = await db.statusPage.findUnique({
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
          endpoints={page.endpoints.map((endpoint) => ({
            id: endpoint.id,
            name: endpoint.name,
            url: endpoint.url,
          }))}
        />
      </div>
    </div>
  );
}
