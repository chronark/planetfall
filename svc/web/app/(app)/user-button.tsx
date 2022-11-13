"use client";

import { SignOutButton, useAuth } from "@clerk/nextjs";
import * as Popover from "@radix-ui/react-popover";
import cx from "classnames";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
	user: {
		name: string;
		email: string;
		image: string;
	};
};

export const UserButton: React.FC<Props> = ({ user }): JSX.Element => {
	const auth = useAuth();
	return (
		<Popover.Root>
			<Popover.Trigger className="flex items-center justify-between gap-4 px-2 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded duration-500">
				<span className="text-sm ">{user.name}</span>

				<Image
					src={user.image}
					width={64}
					height={64}
					className="rounded-full h-8 w-8"
					alt="User profile image"
				/>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content className="border flex flex-col items-start rounded shadow-lg w-full bg-white z-30 divide-y divide-slate-200">
					<div
						// href="/settings"

						className="rounded px-3 py-1 text-sm font-medium text-slate-400"
					>
						Settings
					</div>
					<button
						className="rounded px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
						onClick={() => auth.signOut()}
					>
						Sign Out
					</button>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
};
