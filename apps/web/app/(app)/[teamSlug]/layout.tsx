import { DesktopNavbar } from "../navbar-desktop";
import { Banner } from "@/components/banner";
import { auth } from "@clerk/nextjs/app-beta";
import { Team, db } from "@planetfall/db";
import { getUsage } from "@planetfall/tinybird";
import ms from "ms";
import Link from "next/link";
import { redirect } from "next/navigation";

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

  return (
    <div className="min-h-screen pb-8 bg-zinc-50 lg:pb-16">
      <ShowBanner team={team} usage={totalUsage} />
      <DesktopNavbar teamSlug={props.params.teamSlug} />

      <main className="px-4 lg:px-0">{props.children}</main>
    </div>
  );
}

/**
 * Shows a banner if necessary
 */
const ShowBanner: React.FC<{ team: Team; usage: number }> = ({ team, usage }) => {
  const fmt = new Intl.NumberFormat("en-US").format;

  if (team.plan === "DISABLED") {
    return (
      <Banner variant="alert">
        Your team has been disabled. This is likely due to a billing issue. Please{" "}
        <Link href={`/${team.slug}/settings/usage`} className="underline">
          check your billing
        </Link>{" "}
        or{" "}
        <Link href="/support" className="underline">
          contact us
        </Link>
        .
      </Banner>
    );
  }

  if (team.trialExpires) {
    return (
      <Banner>
        Your trial expires in {ms(team.trialExpires.getTime() - Date.now(), { long: true })}.{" "}
        <Link href={`/${team.slug}/settings/usage`} className="underline">
          Add a payment method
        </Link>{" "}
        to keep using Planetfall.
      </Banner>
    );
  }

  if (usage >= team.maxMonthlyRequests) {
    return (
      <Banner variant="alert">
        <div className="text-center">
          <div>
            You have exceeded your plan&apos;s monthly usage limit: <strong>{fmt(usage)}</strong> /{" "}
            <strong>{fmt(team.maxMonthlyRequests)}</strong>
          </div>
          <div>
            <Link href={`/${team.slug}/settings/plans`} className="underline">
              Upgrade your plan
            </Link>{" "}
            or{" "}
            <Link href="/support" className="underline">
              contact us
            </Link>{" "}
            to keep using Planetfall.
          </div>
        </div>
      </Banner>
    );
  }

  if (usage >= team.maxMonthlyRequests * 0.8) {
    return (
      <Banner>
        You are close to your plan&apos;s monthly usage limit: {fmt(usage)} /{" "}
        {fmt(team.maxMonthlyRequests)}.{" "}
        <Link href={`/${team.slug}/settings/plans`} className="underline">
          Upgrade
        </Link>{" "}
        to keep using Planetfall.
      </Banner>
    );
  }

  return null;
};
