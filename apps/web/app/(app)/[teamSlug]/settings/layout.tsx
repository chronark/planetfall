import { auth } from "@clerk/nextjs/app-beta";
import { redirect } from "next/navigation";
import { Banner } from "@/components/banner";
import Link from "next/link";
import { db } from "@planetfall/db";
import ms from "ms";
import classNames from "classnames";
import { NavLink } from "./NavLink";

export default async function SettingsLayout(props: {
  children: React.ReactNode;
  params: { teamSlug: string };
}) {
  const { userId } = auth();
  if (!userId) {
    return redirect("/auth/sign-in");
  }

  const links: { href: string; slug: string | null; label: string }[] = [
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
  ];

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
