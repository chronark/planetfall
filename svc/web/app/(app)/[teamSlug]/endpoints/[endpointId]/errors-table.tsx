"use client";

import React from "react";
import type { Check } from "@planetfall/tinybird";

import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
export type Props = {
	errors: Check[];
};

export const ErrorsTable: React.FC<Props> = ({ errors }): JSX.Element => {
	const { accessor } = createColumnHelper<Check>();

	const columns = [
		accessor("time", {
			header: "Time",
			cell: (info) => info.getValue()?.toLocaleString(),
		}),

		accessor("status", {
			header: "Status",
			cell: (info) => (
				<span className="px-2 py-0.5 bg-zinc-50 border-zinc-200 rounded border">
					{info.getValue()}
				</span>
			),
		}),
		accessor("error", {
			header: "Error",
		}),
		accessor("latency", {
			header: "Latency",
			cell: (info) => `${info.getValue()?.toLocaleString()} ms`,
		}),

		accessor("regionId", {
			header: "Region",
			cell: (info) =>
				// regions.data?.find((r) => r.id === info.getValue())?.name ??
				info.getValue(),
		}),
	];
	const table = useReactTable({
		data: errors
			.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
			.slice(0, 10),
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
