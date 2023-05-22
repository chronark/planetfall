import { ClientPage } from "./client";
import { auth } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
import { redirect } from "next/navigation";

export default async function AlertsPage(props: { params: { teamSlug: string } }) {
  const { userId } = auth();
  if (!userId) {
    return redirect("/auth/sign-in");
  }
  const team = await db.team.findUnique({
    where: { slug: props.params.teamSlug },
    include: {
      endpoints: true,
    },
  });
  if (!team) {
    return redirect("/home");
  }

  return (
    <ClientPage
      team={{
        id: team.id,
        slug: team.slug,
        endpoints: team.endpoints.map((e) => ({ id: e.id, name: e.name })),
      }}
    />
  );
}
