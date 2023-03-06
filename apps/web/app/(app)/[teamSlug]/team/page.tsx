import PageHeader from "@/components/page/header";
import { notFound, redirect } from "next/navigation";
import { TeamTable } from "./table";
import { db } from "@planetfall/db";

import { auth } from "@clerk/nextjs/app-beta";
export default async function Page(props: { params: { teamSlug: string } }) {
  const { userId } = auth();
  if (!userId) {
    return redirect("/auth/sign-in");
  }

  const team = await db.team.findUnique({
    where: {
      slug: props.params.teamSlug,
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });
  if (!team) {
    return notFound();
  }
  if (!team.members.some((m) => m.userId === userId)) {
    return notFound();
  }

  return (
    <div>
      <PageHeader sticky={true} title={team.name} />
      <main className="container mx-auto">
        {team.members.length > 0 ? (
          <TeamTable members={team.members} />
        ) : (
          <div className="text-center text-zinc-500">No members</div>
        )}
      </main>
    </div>
  );
}
