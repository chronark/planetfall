import { asyncComponent } from "lib/api/component";
import { UserButton } from "./user-button";
import { notFound, redirect } from "next/navigation";
import { NavLink } from "./navlink";
import { TeamSwitcher } from "./team-switcher";
import { Breadcrumbs } from "./breadcrumbs";

import { db } from "@planetfall/db";
import { currentUser } from "@clerk/nextjs/app-beta";

export type NavbarProps = {
  teamSlug: string;
};

export const DesktopNavbar = asyncComponent(async (props: NavbarProps) => {
  const user = await currentUser();

  if (!user) {
    return redirect("/auth/sign-in");
  }

  const navigation: { name: string; href: string }[] = [
    { name: "Endpoints", href: `/${props.teamSlug}/endpoints` },
    { name: "Pages", href: `/${props.teamSlug}/pages` },
    { name: "Playground", href: "/play" },
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
    <nav className="bg-white border-b border-zinc-300">
      <div className="container px-4 pt-2 mx-auto sm:px-0">
        <div className="flex items-center justify-between">
          <Breadcrumbs
            teamSwitcher={
              <TeamSwitcher
                teams={teams.map((t) => ({
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
              email: user.emailAddresses[0]?.emailAddress,
              name: user.username ?? user.emailAddresses[0]?.emailAddress ?? "Unknown",
              image: user.profileImageUrl,
            }}
          />
        </div>
        <div className="mt-2 lg:mt-4">
          {navigation.map((item) => (
            <NavLink key={item.name} href={item.href} label={item.name} />
          ))}
        </div>
      </div>
    </nav>
  );
});
