import { db } from "@planetfall/db";
import { auth } from "@clerk/nextjs/app-beta";
import { notFound, redirect } from "next/navigation";

export default async function Home() {
  const { userId } = auth();
  if (!userId) {
    return redirect("/auth/sign-in");
  }

  let team = await db.team.findFirst({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    take: 1,
  });

  if (!team) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    team = await db.team.findFirst({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      take: 1,
    });
  }
  if (!team) {
    return notFound();
  }
  redirect(`/${team!.slug}`);
}
