import { DeleteCard } from "./DeleteCard";
import { TeamCard } from "./TeamCard";
import { ChangeNameCard } from "./change-name";
import { ChangeSlugCard } from "./change-slug";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Divider } from "@/components/divider";
import { Input } from "@/components/input";
import { Tag } from "@/components/tag";
import { auth } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
import { notFound, redirect } from "next/navigation";
import React from "react";

export default async function SettingsPage(props: {
  params: { teamSlug: string };
}) {
  const { userId } = auth();
  if (!userId) {
    return redirect("/auth/sign-in");
  }

  const team = await db.team.findUnique({
    where: { slug: props.params.teamSlug },
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
  const user = team.members.find((m) => m.userId === userId);
  if (!user) {
    return notFound();
  }

  // const protocol = process.env.NEXT_PUBLIC_VERCEL_ENV ? "https" : "http";
  // const host = process.env.NEXT_PUBLIC_VERCEL_ENV
  //     ? "planetfall.io"
  //     : "localhost:3000";

  // async function handleCheckout(plan: "PRO" | "PERSONAL") {
  //     const { url } = await checkout.mutateAsync({
  //         teamId: team!.id,
  //         returnUrl: `${protocol}://${host}/${router.asPath}`,
  //         plan,
  //     });
  //     if (url) {
  //         router.push(url);
  //     }
  // }

  return (
    <main className="container flex flex-col mx-auto space-y-4 lg:space-y-8">
      <ChangeNameCard teamId={team.id} name={team.name} />
      <ChangeSlugCard teamId={team.id} slug={team.slug} />
      <TeamCard
        teamId={team.id}
        currentUser={{ userId: user.userId, role: user.role }}
        members={team.members.map((m) => ({
          user: { id: m.userId, name: m.user.name, image: m.user.image },
          role: m.role,
        }))}
      />

      <Card>
        <CardHeader>
          <CardTitle>Team ID</CardTitle>
        </CardHeader>
        <CardContent>
          <Input className="max-w-sm" value={team.id} readOnly />
        </CardContent>
      </Card>
      {user.role === "OWNER" ? (
        <>
          <DeleteCard teamId={team.id} teamSlug={team.slug} />
        </>
      ) : null}
    </main>
  );
}
