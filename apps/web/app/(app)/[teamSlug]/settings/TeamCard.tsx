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
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/table/table";
import { Badge } from "@/components/badge";
import { Trash } from "lucide-react";

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
  const [invitationId, _setInvitationId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [_loading, _setLoading] = useState(false);
  const toast = useToast();

  const invite = trpc.team.createInvitation.useMutation({
    onSuccess() {
      setOpen(false);
      toast.addToast({
        title: "Invitation sent",
        content: `We have sent an invitation to ${inviteEmail}`,
      });
    },
    onError(error) {
      setOpen(false);
      toast.addToast({
        title: "Error",
        content: error.message,
        variant: "error",
      });
    },
  });

  const actions: JSX.Element[] = [];
  if (currentUser.role === "OWNER" || currentUser.role === "ADMIN") {
    actions.push(
      <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
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
      <CardHeader actions={[actions]}>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.user.id}>
                <TableCell>
                  <div className="flex items-center">
                    <Image
                      width={64}
                      height={64}
                      className="w-10 h-10 rounded-full"
                      src={member.user.image ?? ""}
                      alt={`Profile image of ${member.user.name}`}
                    />

                    <span className="ml-3 text-sm font-medium text-zinc-900">
                      {member.user.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge>{member.role}</Badge>
                </TableCell>

                <TableCell>
                  {(currentUser.role === "OWNER" && member.role !== "OWNER") ||
                  (currentUser.role === "ADMIN" && member.role === "MEMBER") ? (
                    <Confirm
                      title="Remove user"
                      trigger={
                        <Button variant="danger" size="sm">
                          Remove
                        </Button>
                      }
                      onConfirm={() => {}}
                    />
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
