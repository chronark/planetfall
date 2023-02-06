"use client";

import {
	DialogContent,
	Dialog,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/dialog";
import {
	DropdownMenuTrigger,
	DropdownMenu,
	DropdownMenuContent,
} from "@/components/dropdown";
import { trpc } from "@/lib/utils/trpc";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../components";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { useForm } from "react-hook-form";
import { Loading } from "@/components/loading";

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
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const {
		register,
		formState: { errors },
		handleSubmit,
	} = useForm<{ name: string }>({ reValidateMode: "onSubmit" });

	const submit = async (data: { name: string }) => {
		setLoading(true);

		try {
			const team = await trpc.team.create.mutate({
				teamName: data.name,
			});

			router.push(`/${team.slug}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="flex items-center justify-between gap-4 px-2 py-1 mx-2 rounded hover:bg-zinc-100">
				<span>{currentTeam?.name}</span>
				<ChevronsUpDown className="w-4 h-4" />
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
								<Check className="w-4 h-4" />
							) : null}
						</Link>
					</div>
				</div>
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
									<Check className="w-4 h-4" />
								) : null}
							</Link>
						))}

						<Dialog>
							<DialogTrigger className="flex items-center justify-between gap-4 px-3 py-2 text-sm font-medium rounded-md lg:gap-8 xl:gap-16 group text-zinc-600 hover:bg-zinc-100 hover:text-zinc-90">
								<span className="truncate">Create New Team</span>

								<Plus className="w-4 h-4" />
							</DialogTrigger>
							<DialogContent>
								<DialogTitle>Create new team</DialogTitle>
								<DialogDescription>
									All new teams start with a 14 day trial, afterwards you need
									to add a credit card
								</DialogDescription>

								<form onSubmit={handleSubmit(submit)} className="">
									<Label htmlFor="name">Name</Label>
									<div className="mt-1 ">
										<Input
											type="text"
											{...register("name", {
												required: true,
											})}
											placeholder="dub.sh"
										/>
										{errors.name ? (
											<p className="mt-2 text-sm text-red-500">
												{errors.name.message || "A name is required"}
											</p>
										) : null}
									</div>

									<DialogFooter className="mt-4">
										<Button type="submit">
											{loading ? <Loading /> : "Create"}
										</Button>
									</DialogFooter>
								</form>
							</DialogContent>
						</Dialog>
					</div>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
