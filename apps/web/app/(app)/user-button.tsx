"use client";

import { useClerk } from "@clerk/nextjs/app-beta/client";
import * as Dropdown from "@/components/dropdown";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/avatar";
import { Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
type Props = {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
};

export const UserButton: React.FC<Props> = ({ user }): JSX.Element => {
  const clerk = useClerk();
  const router = useRouter();
  console.log({ user });
  return (
    <Dropdown.DropdownMenu>
      <Dropdown.DropdownMenuTrigger className="flex items-center justify-between gap-4 px-2 py-1 duration-500 rounded text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100">
        <span className="text-sm ">{user.name}</span>

        <Avatar>
          <AvatarImage src={user.image ?? ""} />
          <AvatarFallback>{user.name.split(" ").map((s) => s[0].toUpperCase())}</AvatarFallback>
        </Avatar>
      </Dropdown.DropdownMenuTrigger>
      <Dropdown.DropdownMenuContent
        sideOffset={5}
        className="z-30 p-4 bg-white border rounded shadow-lg"
      >
        {/* <Link
					href="/docs"
					className="flex items-center justify-between w-full gap-4 px-3 py-2 text-sm font-medium rounded-md lg:gap-8 xl:gap-16 group text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
				>
					<span className="truncate">Documentation</span>

					<BookOpen className="w-4 h-4" />
				</Link> */}
        <button
          disabled={true}
          // href={`/${personalTeam?.slug}`}
          className="flex items-center justify-between w-full gap-4 px-3 py-2 text-sm font-medium rounded-md lg:gap-8 xl:gap-16 group text-zinc-400 "
        >
          <span className="truncate">Settings</span>

          <Settings className="w-4 h-4" />
        </button>

        <div className="w-full h-px border-t border-zinc-200" />
        <button
          onClick={async () => {
            await clerk.signOut();
            router.refresh();
          }}
          className="flex items-center justify-between w-full gap-4 px-3 py-2 text-sm font-medium rounded-md lg:gap-8 xl:gap-16 group text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        >
          <span className="truncate">Sign Out</span>

          <LogOut className="w-4 h-4" />
        </button>
      </Dropdown.DropdownMenuContent>
    </Dropdown.DropdownMenu>
  );
};
