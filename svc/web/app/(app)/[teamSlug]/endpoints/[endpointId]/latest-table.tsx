"use client";

import React, { useEffect, useReducer, useState } from "react";
import type { Check } from "@planetfall/tinybird";

import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import ms from "ms";
import Link from "next/link";
import { MinusIcon } from "@heroicons/react/24/outline";
import { usePathname, useSearchParams } from "next/navigation";
export type Props = {
	checks: Check[];
	teamSlug: string;
};

export const LatestTable: React.FC<Props> = ({
	checks,
	teamSlug,
}): JSX.Element => {
	const { accessor } = createColumnHelper<Check>();

	const columns = [
		accessor("error", {
			header: "Success",
			cell: (info) =>
				info.getValue() ? (
					<div className="flex h-6 w-6 items-center justify-center mr-2">
						<span className="animate-ping-slow absolute inline-flex h-4 w-4 rounded-full bg-rose-400 opacity-50" />
						<span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
					</div>
				) : (
					<div className="flex h-6 w-6 items-center justify-center mr-2">
						<span className="absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 opacity-50" />
						<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
					</div>
				),
		}),
		accessor("time", {
			header: "Time",
			cell: (info) => new Date(info.getValue()).toLocaleString(),
		}),

		accessor("status", {
			header: "Status",
			cell: (info) => (
				<span className="px-2 py-0.5 bg-slate-50 border-slate-200 rounded border">
					{info.getValue()}
				</span>
			),
		}),
		accessor("error", {
			header: "Error",
			cell: (info) =>
				info.getValue() ?? <MinusIcon className="w-4 h-4 text-slate-400" />,
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
		accessor("id", {
			header: "",
			cell: (info) => (
				<Link href={`/${teamSlug}/checks/${info.getValue()}`}>Details</Link>
			),
		}),
	];
	const table = useReactTable({
		data: checks
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
								className="whitespace-nowrap px-3 py-2 text-sm text-slate-500"
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
