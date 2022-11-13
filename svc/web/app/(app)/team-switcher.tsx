"use client";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import * as Popover from "@radix-ui/react-popover";
import Link from "next/link";

type Props = {
  teams: {
    isPersonal: Boolean;
    id: string;
    name: string;
    slug: string;
  }[];
  currentTeamId: string;
};

export const TeamSwitcher: React.FC<Props> = ({
  teams,
  currentTeamId,
}): JSX.Element => {
  const personalTeam = teams.find((team) => team.isPersonal)!;
  const currentTeam = teams.find((team) => team.id === currentTeamId)!;
  const sharedTeams = teams.filter((team) => !team.isPersonal);

  return (
    <Popover.Root>
      <Popover.Trigger className="rounded px-2 py-1 mx-2 hover:bg-slate-100 flex justify-between items-center gap-4">
        <span>{currentTeam?.name}</span>
        <ChevronUpDownIcon className="w-4 h-4" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={5}
          className="border p-4 rounded shadow-lg bg-white z-30 divide-y divide-slate-200"
        >
          <div className="py-2">
            <h3 className="px-3 text-xs font-medium text-slate-500">
              Personal
            </h3>
            <div className="mt-1 space-y-1" aria-labelledby="projects-headline">
              <Link
                href={`/${personalTeam?.slug}`}
                className={`gap-4 lg:gap-8 xl:gap-16 group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${
                  currentTeam.id === personalTeam.id ? "bg-slate-100" : ""
                }`}
              >
                <span className="truncate">{personalTeam.name}</span>

                {currentTeam.id === personalTeam.id
                  ? <CheckIcon className="w-4 h-4" />
                  : null}
              </Link>
            </div>
          </div>
          {sharedTeams.length > 0
            ? (
              <div className="py-2">
                <h3
                  className="px-3 text-xs font-medium text-slate-500"
                  id="projects-headline"
                >
                  Teams
                </h3>
                <div className="mt-1 space-y-1">
                  {sharedTeams.map((team) => (
                    <Link
                      key={team.slug}
                      href={`/${team?.slug}`}
                      className={`gap-4 lg:gap-8 xl:gap-16 group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${
                        currentTeam.id === team.id ? "bg-slate-100" : ""
                      }`}
                    >
                      <span className="truncate">{team.name}</span>
                      {currentTeam.id === team.id
                        ? <CheckIcon className="w-4 h-4" />
                        : null}
                    </Link>
                  ))}
                </div>
              </div>
            )
            : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
