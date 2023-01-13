"use client";

import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Legend } from "@tremor/react";
import classNames from "classnames";
import { usePathname } from "next/navigation";
import { Shared } from "pages/api/v1/fly/curl";

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

type Check = {
	region: {
		id: string;
		name: string;
	};
	checks: {
		id: string;
		latency?: number;
		status?: number;
		timing: {
			dnsStart: number;
			dnsDone: number;
			connectStart: number;
			connectDone: number;
			firstByteStart: number;
			firstByteDone: number;
			tlsHandshakeStart: number;
			tlsHandshakeDone: number;
			transferStart: number;
			transferDone: number;
		};
	}[];
};

type Props = {
	regions: Shared["regions"];
};

const Cell: React.FC<{ value: (number | string | undefined)[] }> = ({
	value,
}) => {
	if (value.length === 1) {
		return <div className="w-full text-right ">{value[0]}</div>;
	} else {
		return (
			<div className="w-full text-right">
				<div className="">{value[0]}</div>
				<div className="">{value[1]}</div>
			</div>
		);
	}
};

export const Table: React.FC<Props> = ({ regions }) => {
	const fmt = (n: number | undefined) => {
		if (n === undefined) {
			return "N/A";
		}
		return `${Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(
			n,
		)} ms`;
	};

	const data = regions.map((r) => ({
		name: r.name,
		latency: r.checks.map((c) => fmt(c.latency)),
		status: r.checks.map((c) => c.status),
		dns: r.checks.map((c) => fmt(c.timing.dnsDone - c.timing.dnsStart)),
		connect: r.checks.map((c) =>
			fmt(c.timing.connectDone - c.timing.connectStart),
		),
		tls: r.checks.map((c) =>
			fmt(c.timing.tlsHandshakeDone - c.timing.tlsHandshakeStart),
		),
		ttfb: r.checks.map((c) =>
			fmt(c.timing.firstByteDone - c.timing.firstByteStart),
		),
		total: r.checks.map((c) => fmt(c.latency)),
	}));
	const { accessor } = createColumnHelper<typeof data[0]>();

	let columns = [
		accessor("name", {
			header: "Region",
			cell: (info) => info.getValue(),
		}),

		accessor("status", {
			header: "Status",
			cell: (info) => <Cell value={info.getValue()} />,
		}),
		accessor("dns", {
			header: "DNS",
			cell: (info) => <Cell value={info.getValue()} />,
		}),
		accessor("connect", {
			header: "Connect",

			cell: (info) => <Cell value={info.getValue()} />,
		}),

		accessor("tls", {
			header: "TLS",

			cell: (info) => <Cell value={info.getValue()} />,
		}),
		accessor("ttfb", {
			header: "TTFB",

			cell: (info) => <Cell value={info.getValue()} />,
		}),
		accessor("total", {
			header: "Total",

			cell: (info) => <Cell value={info.getValue()} />,
		}),
	];

	if (data[0].latency.length > 1) {
		columns = [
			columns[0],
			accessor("latency", {
				header: "Check",
				cell: (info) => (
					<div className="flex flex-col items-start gap-1 text-sm font-semibold text-left ">
						<Legend categories={["Cold"]} colors={["blue"]} />
						<Legend categories={["Hot"]} colors={["red"]} />
					</div>
				),
			}),
			...columns.slice(1),
		] as any;
	}
	const table = useReactTable({
		data,
		columns,

		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div>
			<table
				className="min-w-full border-separate"
				style={{ borderSpacing: 0 }}
			>
				<thead className="sticky">
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header, i) => (
								<th
									key={header.id}
									className={classNames(
										"sticky px-4 bg-white z-10  border-t border-b border-zinc-400  py-3.5  text-sm font-semibold text-zinc-900",
										{
											"text-left":
												regions[0].checks.length > 1 ? i <= 1 : i === 0,
											"text-right":
												regions[0].checks.length > 1 ? i > 1 : i > 0,
											"rounded-l border-l": i === 0,
											"rounded-r border-r ":
												i + 1 === headerGroup.headers.length,
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
					{table.getRowModel().rows.map((row, i) => (
						<tr key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<td
									key={cell.id}
									className={classNames(
										"px-4 py-2 whitespace-nowrap text-zinc-500",
										{
											"border-t border-zinc-100": i > 0,
										},
									)}
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
		</div>
	);
};
