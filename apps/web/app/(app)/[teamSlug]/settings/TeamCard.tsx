"use client";
import React from "react";
import {
	Button,
	Card,
	Text,
	CardContent,
	CardFooter,
	CardHeader,
	CardFooterActions,
	CardHeaderTitle,
	Confirm,
} from "@/components/index";
import Link from "next/link";
import { UpgradeButton } from "./UpgradeButton";
import { PortalButton } from "./PortalButton";
import { createCollapsibleScope } from "@radix-ui/react-collapsible";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { MemberRole } from "@prisma/client";
import {
	DialogDescription,
	DialogHeader,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogTitle,
	DialogTrigger,
} from "@/components/dialog";
import { Tag } from "@/components/tag";
import Image from "next/image";

type Props = {
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

export const TeamCard: React.FC<Props> = ({
	members,
	currentUser,
}): JSX.Element => {
	const { accessor } = createColumnHelper<Props["members"][0]>();

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
					<span className="ml-3 text-sm font-medium text-zinc-900">
						{info.getValue().name}
					</span>
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
						<DialogTitle>
							Dang, I&apos;m too slow to ship new features
						</DialogTitle>
						<DialogDescription>
							Sorry this isn&apos;t available yet. I&apos;m working on it! Send
							an email to andreas@planetfall.io and I&apos;ll manually add your
							teammates.
						</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>,
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardHeaderTitle title="Members" actions={actions} />
			</CardHeader>
			<CardContent>
				<table
					className="min-w-full border-separate"
					style={{ borderSpacing: 0 }}
				>
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header, i) => (
									<th
										key={header.id}
										className="sticky px-4 bg-white z-10  border-zinc-400  py-3.5 text-left text-sm font-semibold text-zinc-900"
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
											  )}
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
											: flexRender(
													header.column.columnDef.footer,
													header.getContext(),
											  )}
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
