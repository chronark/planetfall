"use client";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";

import {
	DropdownMenuTrigger,
	DropdownMenu,
	DropdownMenuContent,
} from "@/components/dropdown";
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
		<DropdownMenu>
			<DropdownMenuTrigger className="flex items-center justify-between gap-4 px-2 py-1 mx-2 rounded hover:bg-zinc-100">
				<span>{currentTeam?.name}</span>
				<ChevronUpDownIcon className="w-4 h-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent
				sideOffset={5}
				className="z-30 p-4 bg-white border divide-y rounded shadow-lg divide-zinc-200"
			>
				<div className="py-2">
					<h3 className="px-3 text-xs font-medium text-zinc-500">Personal</h3>
					<div className="mt-1 space-y-1" aria-labelledby="projects-headline">
						<Link
							href={`/${personalTeam?.slug}`}
							className={`gap-4 lg:gap-8 xl:gap-16 group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 ${
								currentTeam.id === personalTeam.id ? "bg-zinc-100" : ""
							}`}
						>
							<span className="truncate">{personalTeam.name}</span>

							{currentTeam.id === personalTeam.id ? (
								<CheckIcon className="w-4 h-4" />
							) : null}
						</Link>
					</div>
				</div>
				{sharedTeams.length > 0 ? (
					<div className="py-2">
						<h3
							className="px-3 text-xs font-medium text-zinc-500"
							id="projects-headline"
						>
							Teams
						</h3>
						<div className="mt-1 space-y-1">
							{sharedTeams.map((team) => (
								<Link
									key={team.slug}
									href={`/${team?.slug}`}
									className={`gap-4 lg:gap-8 xl:gap-16 group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 ${
										currentTeam.id === team.id ? "bg-zinc-100" : ""
									}`}
								>
									<span className="truncate">{team.name}</span>
									{currentTeam.id === team.id ? (
										<CheckIcon className="w-4 h-4" />
									) : null}
								</Link>
							))}
						</div>
					</div>
				) : null}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
