import { db } from "@planetfall/db";
import { notFound, redirect } from "next/navigation";

export default async function Layout({
  children,
  params,
}: { children: React.ReactNode; params: { teamSlug: string } }) {
  const team = await db.team.findUnique({
    where: {
      slug: params.teamSlug,
    },
  });
  if (!team) {
    return redirect("/home");
  }
  if (team.plan !== "ENTERPRISE" && team.plan !== "PRO") {
    return notFound();
  }

  return <>{children}</>;
}
