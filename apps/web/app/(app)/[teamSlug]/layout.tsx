import { auth } from "@clerk/nextjs/app-beta";
import { redirect } from "next/navigation";
import { Banner } from "@/components/banner";
import { DesktopNavbar } from "../navbar-desktop";
import Link from "next/link";
import { db } from "@planetfall/db";
import ms from "ms";
import { getUsage } from "@planetfall/tinybird";

export const revalidate = 60;

export default async function AppLayout(props: {
  children: React.ReactNode;
  params: { teamSlug: string };
}) {
  const { userId } = auth();
  if (!userId) {
    return redirect("/auth/sign-in");
  }
  const team = await db.team.findUnique({
    where: { slug: props.params.teamSlug },
  });
  if (!team) {
    return redirect("/home");
  }
  const usage = await getUsage({
    teamId: team.id,
    year: new Date().getUTCFullYear(),
    month: new Date().getUTCMonth() + 1,
  });

  const totalUsage = usage.data.reduce((acc, cur) => acc + cur.usage, 0);

  const fmt = new Intl.NumberFormat("en-US").format;
  return (
    <div className="min-h-screen pb-8 bg-zinc-50 lg:pb-16">
      {team.trialExpires ? (
        <Banner>
          Your trial expires in {ms(team.trialExpires.getTime() - Date.now(), { long: true })}.{" "}
          <Link href={`/${team.slug}/settings/billing`} className="underline">
            Add a payment method
          </Link>{" "}
          to keep using Planetfall.
        </Banner>
      ) : totalUsage >= team.maxMonthlyRequests ? (
        <Banner variant="alert">
          <div className="text-center">
            <div>
              You have exceeded your plan&apos;s monthly usage limit:{" "}
              <strong>{fmt(totalUsage)}</strong> / <strong>{fmt(team.maxMonthlyRequests)}</strong>
            </div>
            <div>
              <Link href={`/${team.slug}/settings/plans`} className="underline">
                Upgrade your plan
              </Link>{" "}
              or{" "}
              <Link href={`/${team.slug}/support`} className="underline">
                contact us
              </Link>{" "}
              to keep using Planetfall.
            </div>
          </div>
        </Banner>
      ) : totalUsage >= team.maxMonthlyRequests * 0.8 ? (
        <Banner>
          You are close to your plan&apos;s monthly usage limit: {fmt(totalUsage)} /{" "}
          {fmt(team.maxMonthlyRequests)}.{" "}
          <Link href={`/${team.slug}/settings/plans`} className="underline">
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
