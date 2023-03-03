import { db } from "@planetfall/db";
import { currentUser } from "@clerk/nextjs/app-beta";
import { notFound, redirect } from "next/navigation";

export default async function Home() {
    const user =await currentUser();
  if(!user){
    return redirect("/auth/sign-in");
  }

  const team = await db.team.findFirst({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });

  if (!team) {
    notFound();
  }
  redirect(`/${team.slug}`);
}
