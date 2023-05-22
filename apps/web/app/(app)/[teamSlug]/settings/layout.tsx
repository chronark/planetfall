import { NavLink } from "./NavLink";
import { Banner } from "@/components/banner";
import { auth } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
import classNames from "classnames";
import ms from "ms";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SettingsLayout(props: {
  children: React.ReactNode;
  params: { teamSlug: string };
}) {
  const { userId } = auth();
  if (!userId) {
    return redirect("/auth/sign-in");
  }

  const team = await db.team.findUnique({
    where: { slug: props.params.teamSlug },
  })

  const links = [
    {
      label: "General",
      slug: null,
      href: `/${props.params.teamSlug}/settings`,
    },
    {
      label: "Alerts",
      slug: "alerts",
      href: `/${props.params.teamSlug}/settings/alerts`,
    },
    team?.plan === "ENTERPRISE" || team?.plan === "PRO" ?
      {
        label: "API Keys",
        slug: "keys",
        href: `/${props.params.teamSlug}/settings/keys`,
      } : null,
    {
      label: "Usage & Billing",
      slug: "usage",
      href: `/${props.params.teamSlug}/settings/usage`,
    },

    {
      label: "Plans",
      slug: "plans",
      href: `/${props.params.teamSlug}/settings/plans`,
    },
    // {
    //     label: 'Members',
    //     slug: 'members',
    //     href: `/${props.params.teamSlug}/settings/members`,
    // },
    // {
    //     label: 'Danger',
    //     slug: 'danger',
    //     href: `/${props.params.teamSlug}/settings/danger`,
    // },
  ].filter(Boolean) as { href: string; slug: string | null; label: string }[]

  return (
    <div className="container flex flex-col items-center justify-center mx-auto mt-8 lg:flex-row lg:items-start lg:mt-24">
      <aside className="flex flex-row lg:flex-col lg:justify-start justify-between gap-4 min-w-[12rem]">
        {links.map((link) => (
          <NavLink key={link.label} {...link} />
        ))}
      </aside>
      <main className="flex-grow mt-8 lg:mt-0">{props.children}</main>
    </div>
  );
}
