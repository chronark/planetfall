import { getSession } from "lib/auth";
import { redirect } from "next/navigation";
import { Banner } from "@/components/banner";
import { DesktopNavbar } from "../navbar-desktop";
import Link from "next/link";
import { db } from "@planetfall/db";
import ms from "ms";

export default async function AppLayout(props: {
  children: React.ReactNode;
  params: { teamSlug: string };
}) {
  const session = await getSession();
  if (!session) {
    return redirect("/auth/sign-in");
  }
  const team = await db.team.findUnique({
    where: { slug: props.params.teamSlug },
  });
  if (!team) {
    return redirect("/home");
  }

  return (
    <div className="min-h-screen pb-8 bg-zinc-50 lg:pb-16">
      {team.trialExpires ? (
        <Banner>
          Your trial expires in {ms(team.trialExpires.getTime() - Date.now(), { long: true })}.{" "}
          <Link href="/pricing" className="underline">
            Upgrade
          </Link>{" "}
          to keep using Planetfall.
        </Banner>
      ) : null}
      <DesktopNavbar teamSlug={props.params.teamSlug} />

      <main className="px-4 lg:px-0">{props.children}</main>
    </div>
  );
}
