import { asyncComponent } from "lib/api/component";
import { UserButton } from "./user-button";
import { notFound, redirect } from "next/navigation";
import { NavLink } from "./navlink";
import { TeamSwitcher } from "./team-switcher";
import { Breadcrumbs } from "./breadcrumbs";

import { db } from "@planetfall/db";
import { auth } from "@clerk/nextjs/app-beta";

export type NavbarProps = {
  teamSlug: string;
};

export const DesktopNavbar = asyncComponent(async (props: NavbarProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/auth/sign-in");
  }

  const navigation: { name: string; href: string }[] = [
    { name: "Endpoints", href: `/${props.teamSlug}/endpoints` },
    { name: "Pages", href: `/${props.teamSlug}/pages` },
    { name: "Playground", href: "/play" },
    { name: "Settings", href: `/${props.teamSlug}/settings` },
    {
      name: "Support",
      href: "/support",
    },
  ];

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    console.warn(__filename, "User not found");
    notFound();
  }

  const teams = await db.team.findMany({
    where: {
      members: { some: { userId } },
    },
  });

  if (teams.some(t=>t.id==="team_NszcknrCNzjFgnLvqUCXGR")){
    navigation.push({ name: "Internal", href: `/${props.teamSlug}/internal/stats/teams` });
  }

  const currentTeam = teams.find((team) => team.slug === props.teamSlug);
  if (!currentTeam) {
    notFound();
  }

  return (
    <nav className="bg-white border-b border-zinc-300 w-full">
      <div className="container w-full pt-2 mx-auto">
        <div className="flex items-center justify-between">
          <Breadcrumbs
            teamSwitcher={
              <TeamSwitcher
                teams={teams.map((t) => ({
                  id: t.id,
                  name: t.name,
                  slug: t.slug,
                  plan: t.plan,
                }))}
                currentTeamId={currentTeam.id}
              />
            }
          />
          <UserButton
            user={{
              email: user.email,
              name: user.name,
              image: user.image,
            }}
          />
        </div>
        <div className="mt-2 lg:mt-4 md:space-x-4 ">
          {navigation.map((item) => (
            <NavLink key={item.name} href={item.href} label={item.name} />
          ))}
        </div>
      </div>
    </nav>
  );
});
