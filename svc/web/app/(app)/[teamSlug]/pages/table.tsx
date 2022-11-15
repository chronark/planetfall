"use client";

import { Button } from "@/components/button";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import Link from "next/link";

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
	const protocol = process.env.NEXT_PUBLIC_VERCEL_URL ? "https" : "http";
	const host = process.env.NEXT_PUBLIC_VERCEL_URL ?? "localhost:3000";

	const { accessor } = createColumnHelper<Page>();

	const columns = [
		accessor("name", {
			header: "Name",
			cell: (info) => (
				<span className="text-sm text-slate-900">{info.getValue()}</span>
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
								className="px-2 py-1 border rounded border-slate-300 bg-slate-50 hover:bg-white hover:border-slate-600"
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
					className="text-slate-500 hover:text-primary-600 duration-500 hover:underline"
					href={`${protocol}://${info.getValue()}.${host}`}
				>
					{`${protocol}://${info.getValue()}.${host}`}
				</Link>
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
									"sticky px-4 bg-white z-10  border-t border-b border-slate-400  py-3.5 text-left text-sm font-semibold text-slate-900",
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
								className="px-3 py-2 text-sm whitespace-nowrap text-slate-500"
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
