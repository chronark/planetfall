"use client";
import React, { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Confirm,
  Text,
  ToastAction,
} from "@/components/index";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MemberRole } from "@prisma/client";
import {
  DialogDescription,
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialog";
import { Tag } from "@/components/tag";
import Image from "next/image";
import { Input } from "@/components/input";
import { trpc } from "@/lib/trpc/hooks";
import { useToast, Toaster } from "@/components/toast";
import { Loading } from "@/components/loading";

type Props = {
  teamId: string;
  currentUser: {
    userId: string;
    role: MemberRole;
  };
  members: {
    user: {
      id: string;
      name: string;
      image: string | null;
    };
    role: MemberRole;
  }[];
};

export const TeamCard: React.FC<Props> = ({ teamId, members, currentUser }): JSX.Element => {
  const { accessor } = createColumnHelper<Props["members"][0]>();
  const [invitationId, _setInvitationId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const invite = trpc.team.createInvitation.useMutation({
    onSuccess() {
      toast.addToast({
        title: "Invitation sent",
        content: `We have sent an invitation to ${inviteEmail}`,
      });
    },
    onError(error) {
      toast.addToast({
        title: "Error",
        content: error.message,
        variant: "error",
      });
    },
  });
  const columns = [
    accessor("user", {
      header: "User",
      cell: (info) => (
        <div className="flex items-center">
          <Image
            width={64}
            height={64}
            className="w-10 h-10 rounded-full"
            src={info.getValue().image ?? ""}
            alt={`Profile image of ${info.getValue().name}`}
          />
          <span className="ml-3 text-sm font-medium text-zinc-900">{info.getValue().name}</span>
        </div>
      ),
    }),
    accessor("role", {
      header: "Role",
      cell: (info) => (
        <Tag variant="outline" size="sm">
          {info.getValue()}
        </Tag>
      ),
    }),
    accessor("role", {
      header: "",
      cell: (info) =>
        (currentUser.role === "OWNER" && info.getValue() !== "OWNER") ||
        (currentUser.role === "ADMIN" && info.getValue() === "MEMBER") ? (
          <Confirm
            title="Remove user"
            trigger={<Button variant="danger">Remove</Button>}
            onConfirm={() => {}}
          />
        ) : null,
    }),
  ];
  const table = useReactTable({
    data: members,
    columns,

    getCoreRowModel: getCoreRowModel(),
  });
  const actions: JSX.Element[] = [];
  if (currentUser.role === "OWNER" || currentUser.role === "ADMIN") {
    actions.push(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Invite User</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send an invitation</DialogTitle>
          </DialogHeader>

          <Text>
            Send an invitation to join this team. The user will receive an email and be able to join
            the team.
          </Text>
          {invitationId ? (
            <Button
              onClick={() => {
                navigator.clipboard.writeText(`https://planetfall.io/invite/${invitationId}`);
                toast.addToast({
                  title: "Copied!",
                  content: "The invitation link has been copied to your clipboard.",
                });
              }}
            >
              Copy invitation link
            </Button>
          ) : (
            <form
              className="flex items-center gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                invite.mutateAsync({
                  teamId,
                  email: inviteEmail,
                });
              }}
            >
              <Input
                type="email"
                placeholder="user@email.com"
                value={inviteEmail}
                onChange={(v) => setInviteEmail(v.currentTarget.value)}
              />
              <Button type="submit" variant="primary">
                {invite.isLoading ? <Loading /> : "Invite"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>,
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <div className="flex items-center justify-end gap-2">{actions}</div>
      </CardHeader>
      <CardContent>
        <table className="min-w-full border-separate" style={{ borderSpacing: 0 }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, _i) => (
                  <th
                    key={header.id}
                    className="sticky px-4 bg-white z-10  border-zinc-400  py-3.5 text-left text-sm font-semibold text-zinc-900"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-2 text-sm rounded whitespace-nowrap text-zinc-500"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            {table.getFooterGroups().map((footerGroup) => (
              <tr key={footerGroup.id}>
                {footerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.footer, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </tfoot>
        </table>
      </CardContent>
    </Card>
  );
};
