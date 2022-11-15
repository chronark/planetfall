"use client";

import { signOut } from "next-auth/react";
import * as Popover from "@radix-ui/react-popover";
import cx from "classnames";
import Image from "next/image";
import Link from "next/link";

import React from "react";
import { useRouter } from "next/navigation";

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
			<Popover.Trigger className="flex items-center justify-between px-2 py-1 rounded gap-4 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 duration-500">
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
				<Popover.Content className="z-30 flex flex-col items-start w-full bg-white border rounded shadow-lg divide-y divide-zinc-200">
					<div // href="/settings"
						className="px-3 py-1 text-sm font-medium rounded text-zinc-400"
					>
						Settings
					</div>
					<button
						className="px-3 py-1 text-sm font-medium rounded text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
						onClick={async () => {
							await signOut({ redirect: false });
							router.push("/");
						}}
					>
						Sign Out
					</button>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
};
