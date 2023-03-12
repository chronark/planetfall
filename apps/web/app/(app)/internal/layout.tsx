import { Button } from "@/components/button";
import { auth, currentUser } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
import { Breadcrumbs } from "app/(app)/breadcrumbs";
import { NavLink } from "app/(app)/navlink";
import { UserButton } from "app/(app)/user-button";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function Layout(props: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) {
    return redirect("/auth/sign-in");
  }
  const team = await db.team.findFirst({
    where: {
      id: "team_NszcknrCNzjFgnLvqUCXGR",
      members: {
        some: {
          userId: user.id,
        },
      },
    },
  });
  if (!team) {
    return notFound();
  }
  
  return (
    <main className="min-h-screen pb-8 bg-zinc-50 lg:pb-16 container mx-auto mt-16">
      {props.children}
    </main>
  );
}
