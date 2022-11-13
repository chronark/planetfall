import { asyncComponent } from "lib/api/component";
import { UserButton } from "./user-button";
import { currentUser } from "@clerk/nextjs/app-beta";
import { notFound, redirect } from "next/navigation";
import { NavLink } from "./navlink";
import { clerkClient } from "@clerk/nextjs/server";
import { TeamSwitcher } from "./team-switcher";
import { Breadcrumbs } from "./breadcrumbs";
import { db } from "@planetfall/db";

const userNavigation = [
  { name: "Settings", href: "/settings" },
  { name: "Sign out", href: "/auth/sign-out" },
];

export type NavbarProps = {
  teamSlug: string;
};

export const DesktopNavbar = asyncComponent(async (props: NavbarProps) => {
  const user = await currentUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  const navigation: { name: string; href: string }[] = [
    { name: "Endpoints", href: `/${props.teamSlug}/endpoints` },
    { name: "Pages", href: `/${props.teamSlug}/pages` },
    { name: "Settings", href: `/${props.teamSlug}/settings` },
  ];

  const teams = await db.team.findMany({
    where: {
      members: { some: { userId: user.id } },
    },
  });

  const currentTeam = teams.find((team) => team.slug === props.teamSlug);
  if (!currentTeam) {
    notFound();
  }

  return (
    <nav className="border-b border-slate-300">
      <div className="container mx-auto pt-2">
        <div className="flex justify-between items-center">
          <Breadcrumbs
            teamSlug={props.teamSlug}
            teamSwitcher={
              <TeamSwitcher
                teams={teams.map((t) => ({
                  isPersonal: t.isPersonal,
                  id: t.id,
                  name: t.name,
                  slug: t.slug,
                }))}
                currentTeamId={currentTeam.id}
              />
            }
          />
          <UserButton
            user={{
              email: user.emailAddresses[0].emailAddress,
              name: user.username ?? "",
              image: user.profileImageUrl,
            }}
          />
        </div>
        <div>
          {navigation.map((item) => (
            <NavLink key={item.name} href={item.href} label={item.name} />
          ))}
        </div>
      </div>
    </nav>
  );
});
