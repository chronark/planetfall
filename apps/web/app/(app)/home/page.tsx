import { db } from "@planetfall/db";
import { auth } from "@clerk/nextjs/app-beta";
import { notFound, redirect } from "next/navigation";

export default async function Home() {
  const { userId } = auth();
  if (!userId) {
    return redirect("/auth/sign-in");
  }

  const team = await db.team.findFirst({
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
    notFound();
  }
  redirect(`/${team.slug}`);
}
