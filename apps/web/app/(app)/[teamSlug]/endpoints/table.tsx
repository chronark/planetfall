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
import { usePathname, useRouter } from "next/navigation";

type Endpoint = {
	id: string;
	name: string | null;
	url: string;
	stats: {
		count: number;
		min: number;
		max: number;
		p50: number;
		p95: number;
		p99: number;
	} | null;
};
type Props = {
	endpoints: Endpoint[];
};

export const EndpointsTable: React.FC<Props> = ({ endpoints }) => {
	const path = usePathname();
	const countFormat = (n: number) =>
		Intl.NumberFormat(undefined, {
			maximumFractionDigits: 1,
			notation: "compact",
		}).format(n);
	const latencyFormat = (n: number) =>
		`${Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(
			n,
		)} ms`;
	const { accessor } = createColumnHelper<Endpoint>();

	const columns = [
		accessor("name", {
			header: "Name",
			cell: (info) => (
				<div className="flex flex-col items-start text-sm font-medium text-zinc-900">
					<span>{info.getValue()}</span>
					<span>{info.row.original.url}</span>
				</div>
			),
		}),
		accessor("stats.count", {
			header: "Count",
			cell: (info) => countFormat(info.getValue()),
		}),
		accessor("stats.min", {
			header: "Min",
			cell: (info) => latencyFormat(info.getValue()),
		}),
		accessor("stats.max", {
			header: "Max",
			cell: (info) => latencyFormat(info.getValue()),
		}),
		accessor("stats.p50", {
			header: "P50",
			cell: (info) => latencyFormat(info.getValue()),
		}),
		accessor("stats.p95", {
			header: "P95",
			cell: (info) => latencyFormat(info.getValue()),
		}),
		accessor("stats.p99", {
			header: "P99",
			cell: (info) => latencyFormat(info.getValue()),
		}),
		accessor("id", {
			header: "",
			cell: (info) => (
				<Link href={`${path}/${info.getValue()}`}>
					<Button>Details</Button>
				</Link>
			),
		}),
	];
	const table = useReactTable({
		data: endpoints,
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
