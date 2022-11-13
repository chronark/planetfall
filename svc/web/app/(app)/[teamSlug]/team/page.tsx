import PageHeader from "@/components/page/header";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { notFound, redirect } from "next/navigation";
import { TeamTable } from "./table";
import { auth } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
export default async function Page(props: { params: { teamSlug: string } }) {
  const { userId } = auth();
  if (!userId) {
    redirect("/auth/sign-in");
  }

  const team = await db.team.findUnique({
    where: {
      slug: props.params.teamSlug,
    },
    include: {
      members: true,
    },
  });
  if (!team) {
    redirect("/home");
  }
  if (!team.members.some((m) => m.userId === userId)) {
    redirect("/home");
  }

  const members = team.isPersonal ? [] : await Promise.all(
    team.members.map(async (m) => {
      const user = await clerkClient.users.getUser(m.userId);
      return {
        role: m.role,
        user: {
          name: user.username!,
          email: user.emailAddresses[0].emailAddress,
          image: user.profileImageUrl,
        },
      };
    }),
  );

  return (
    <div>
      <PageHeader sticky={true} title={team.name} />
      <main className="container mx-auto">
        {members.length > 0
          ? <TeamTable members={members} />
          : <div className="text-center text-slate-500">No members</div>}
      </main>
    </div>
  );
}
