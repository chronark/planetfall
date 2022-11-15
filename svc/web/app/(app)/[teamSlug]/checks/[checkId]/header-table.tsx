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
	header: {
		key: string;
		value: string;
	}[];
};

export const HeaderTable: React.FC<Props> = ({ header }): JSX.Element => {
	const { accessor } = createColumnHelper<{ key: string; value: string }>();

	const columns = [
		accessor("key", {
			header: "Key",
			cell: (info) => <div>{info.getValue()}</div>,
		}),

		accessor("value", {
			header: "Value",
			cell: (info) => <div>{info.getValue()}</div>,
		}),
	];
	const table = useReactTable({
		data: header,
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
