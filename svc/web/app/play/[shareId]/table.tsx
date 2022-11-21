"use client";

import { Button } from "@/components/button";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { usePathname } from "next/navigation";

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
	checks: Check[];
};

const Cell: React.FC<{ value: (number | string | undefined)[] }> = ({
	value,
}) => {
	if (value.length === 1) {
		return <div className="w-full text-right ">{value[0]}</div>;
	} else {
		return (
			<div className="flex items-center justify-center gap-2 px-2 text-right lg:px-4">
				<span className="w-2/5">{value[0]}</span>
				<span className="w-1/5">-</span>
				<span className="w-2/5">{value[1]}</span>
			</div>
		);
	}
};

export const Table: React.FC<Props> = ({ checks }) => {
	const fmt = (n: number | undefined) => {
		if (n === undefined) {
			return "N/A";
		}
		return `${Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(
			n,
		)} ms`;
	};

	const data = checks.map((check) => ({
		region: check.region,
		latency: check.checks.map((c) => fmt(c.latency)),
		status: check.checks.map((c) => c.status),
		dns: check.checks.map((c) => fmt(c.timing.dnsDone - c.timing.dnsStart)),
		connect: check.checks.map((c) =>
			fmt(c.timing.connectDone - c.timing.connectStart),
		),
		tls: check.checks.map((c) =>
			fmt(c.timing.tlsHandshakeDone - c.timing.tlsHandshakeStart),
		),
		ttfb: check.checks.map((c) =>
			fmt(c.timing.firstByteDone - c.timing.firstByteStart),
		),
		total: check.checks.map((c) => fmt(c.latency)),
	}));
	const { accessor } = createColumnHelper<typeof data[0]>();

	const columns = [
		accessor("region", {
			header: "Region",
			cell: (info) => info.getValue().name,
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
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header, i) => (
								<th
									key={header.id}
									className={classNames(
										"sticky px-4 bg-white z-10  border-t border-b border-zinc-400  py-3.5  text-sm font-semibold text-zinc-900",
										{
											"text-center": i > 0,
											"text-left": i === 0,
											"text-right": i > 0 && checks[0].checks.length === 1,
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
			{checks[0].checks.length > 1 ? (
				<div className="py-4">
					<p className="text-sm text-center text-zinc-500">
						This check was run twice to simulate cold and hot caches. The table
						shows both results. On the left is the cold value and on the right
						the hot one.
					</p>
				</div>
			) : null}
		</div>
	);
};
