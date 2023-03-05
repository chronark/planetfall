import { db } from "@planetfall/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClientPage } from "./client";

export default async function PlanPage(props: { params: { teamSlug: string } }) {
  const { session } = await getSession();
  if (!session) {
    return redirect("/auth/sign-in");
  }
  const team = await db.team.findUnique({
    where: { slug: props.params.teamSlug },
  });
  if (!team) {
    return redirect("/home");
  }

  return <ClientPage team={{ id: team.id, plan: team.plan }} />;
}
