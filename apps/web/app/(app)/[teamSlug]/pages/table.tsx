"use client";

import { Button } from "@/components/button";
import { Confirm } from "@/components/confirm";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import Link from "next/link";
import { trpc } from "@/lib/utils/trpc";
import { useRouter } from "next/navigation";

type Page = {
	id: string;
	name: string;
	slug: string;
	endpoints: {
		id: string;
		name: string;
	}[];
};
type Props = {
	teamSlug: string;
	pages: Page[];
};

export const StatuspagesTable: React.FC<Props> = ({ teamSlug, pages }) => {
	const protocol = process.env.NEXT_PUBLIC_VERCEL ? "https" : "http";
	const host = process.env.NEXT_PUBLIC_VERCEL_URL
		? "planetfall.io"
		: "localhost:3000";
	const router = useRouter();

	const { accessor } = createColumnHelper<Page>();

	const columns = [
		accessor("name", {
			header: "Name",
			cell: (info) => (
				<span className="text-sm text-zinc-900">{info.getValue()}</span>
			),
		}),
		accessor("endpoints", {
			header: "Endpoints",
			cell: (info) => (
				<ul className="flex items-center">
					{info.getValue().map((endpoint) => (
						<li key={endpoint.id}>
							<Link
								href={`/${teamSlug}/endpoints/${endpoint.id}`}
								className="px-2 py-1 border rounded border-zinc-300 bg-zinc-50 hover:bg-white hover:border-zinc-600"
							>
								{endpoint.name}
							</Link>
						</li>
					))}
				</ul>
			),
		}),

		accessor("slug", {
			header: "Link",
			cell: (info) => (
				<Link
					target="_blank"
					className="duration-500 text-zinc-500 hover:text-primary-600 hover:underline"
					href={`${protocol}://${info.getValue()}.${host}`}
				>
					{`${protocol}://${info.getValue()}.${host}`}
				</Link>
			),
		}),
		accessor("id", {
			cell: (info) => (
				<Confirm
					title="Delete page"
					description="Are you sure you want to delete this page?"
					onConfirm={async () => {
						await trpc.page.delete.mutate({ pageId: info.getValue() });
						router.refresh();
					}}
					trigger={<Button variant="danger">Delete</Button>}
				/>
			),
		}),
	];
	const table = useReactTable({
		data: pages,
		columns,

		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<table className="min-w-full border-separate" style={{ borderSpacing: 0 }}>
			<thead>
				{table.getHeaderGroups().map((headerGroup) => (
					<tr key={headerGroup.id}>
						{headerGroup.headers.map((header, i) => (
							<th
								key={header.id}
								className={classNames(
									"sticky px-4 bg-white z-10  border-t border-b border-zinc-400  py-3.5 text-left text-sm font-semibold text-zinc-900",
									{
										"rounded-l border-l": i === 0,
										"rounded-r border-r ": i + 1 === headerGroup.headers.length,
									},
								)}
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
								className="px-3 py-2 text-sm whitespace-nowrap text-zinc-500"
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
	);
};
