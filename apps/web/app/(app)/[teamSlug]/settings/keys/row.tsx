"use client";
import { DeleteKeyButton } from "./delete-key";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/dropdown-menu";
import { Book, Key, MoreVertical, Rocket, Settings2, Trash } from "lucide-react";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import Link from "next/link";
import { Dialog } from "@/components/dialog";
import { Badge } from "@/components/badge";

type Props = {
  apiKey: {
    id: string;
    name: string;
    firstCharacters: string | null;
    createdAt: Date;
    policy: string | null;
  };
  team: {
    slug: string;
  };
};

export const Row: React.FC<Props> = ({ apiKey, team }) => {
  return (
    <li
      key={apiKey.id}
      className="flex items-center justify-between px-4 py-5 gap-x-6 md:px-6 lg:px-8"
    >
      <div>
        <p className="text-zinc-800 whitespace-nowrap">{apiKey.name}</p>
        <div className="flex items-center mt-1 text-xs leading-5 gap-x-2 text-zinc-500">
          <p className="whitespace-nowrap">
            Created at{" "}
            <time dateTime={apiKey.createdAt.toISOString()}>{apiKey.createdAt.toUTCString()}</time>
          </p>
        </div>
      </div>
      <div>
        <Badge variant="outline">{apiKey.firstCharacters}...</Badge>
      </div>
      <Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="sm">
              <Settings2 className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full lg:w-56" align="end" forceMount>
            <DropdownMenuGroup>
              <Link href={`/${team.slug}/settings/keys/${apiKey.id}`}>
                <DropdownMenuItem>
                  <Key className="w-4 h-4 mr-2" />
                  <span>Details</span>
                </DropdownMenuItem>
              </Link>

              <DeleteKeyButton keyId={apiKey.id}>
                <DropdownMenuItem
                  onSelect={(e) => {
                    // This magically allows multiple dialogs in a dropdown menu, no idea why
                    e.preventDefault();
                  }}
                >
                  <Trash className="w-4 h-4 mr-2" />
                  <span>Revoke</span>
                </DropdownMenuItem>
              </DeleteKeyButton>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </Dialog>
    </li>
  );
};
