import { auth } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: {
    invitationId: string;
  };
};

export default async function Home(props: Props) {
  const { userId } = auth();
  if (!userId) {
    return redirect("/auth/sign-in");
  }

  const invitation = await db.teamInvitation.findUnique({
    where: {
      id: props.params.invitationId,
    },
    include: {
      team: true,
    },
  });
  if (!invitation) {
    return notFound();
  }
  if (invitation.expires.getTime() < Date.now()) {
    await db.teamInvitation.delete({
      where: {
        id: invitation.id,
      },
    });
    return notFound();
  }
  if (invitation.userId !== userId) {
    return notFound();
  }

  await db.membership.create({
    data: {
      teamId: invitation.team.id,
      userId,
      role: "MEMBER",
    },
  });

  redirect(`/${invitation.team.slug}`);
}
