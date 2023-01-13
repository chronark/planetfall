"use client";

import { signOut } from "next-auth/react";
import * as Popover from "@radix-ui/react-popover";
import Image from "next/image";

import React from "react";
import { useRouter } from "next/navigation";
import {
	AdjustmentsVerticalIcon,
	ArrowRightOnRectangleIcon,
	BookOpenIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

type Props = {
	user: {
		name: string;
		email: string;
		image: string | null;
	};
};

export const UserButton: React.FC<Props> = ({ user }): JSX.Element => {
	const router = useRouter();
	return (
		<Popover.Root>
			<Popover.Trigger className="flex items-center justify-between gap-4 px-2 py-1 duration-500 rounded text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100">
				<span className="text-sm ">{user.name}</span>

				<Image
					src={user.image ?? ""}
					width={64}
					height={64}
					className="w-8 h-8 rounded-full"
					alt="User profile image"
				/>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					sideOffset={5}
					className="z-30 p-4 bg-white border rounded shadow-lg"
				>
					<Link
						href="/docs"
						className="flex items-center justify-between w-full gap-4 px-3 py-2 text-sm font-medium rounded-md lg:gap-8 xl:gap-16 group text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
					>
						<span className="truncate">Documentation</span>

						<BookOpenIcon className="w-4 h-4" />
					</Link>
					<button
						disabled={true}
						// href={`/${personalTeam?.slug}`}
						className="flex items-center justify-between w-full gap-4 px-3 py-2 text-sm font-medium rounded-md lg:gap-8 xl:gap-16 group text-zinc-400 "
					>
						<span className="truncate">Settings</span>

						<AdjustmentsVerticalIcon className="w-4 h-4" />
					</button>

					<div className="w-full h-px border-t border-zinc-200" />
					<button
						onClick={() => signOut()}
						className="flex items-center justify-between w-full gap-4 px-3 py-2 text-sm font-medium rounded-md lg:gap-8 xl:gap-16 group text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
					>
						<span className="truncate">Sign Out</span>

						<ArrowRightOnRectangleIcon className="w-4 h-4" />
					</button>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
};
