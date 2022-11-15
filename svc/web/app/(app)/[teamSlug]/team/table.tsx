"use client";

import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";

type Member = {
	role: string;
	user: {
		name: string;
		email: string;
		image: string | null;
	};
};
type Props = {
	members: Member[];
};

export const TeamTable: React.FC<Props> = ({ members }) => {
	const { accessor } = createColumnHelper<Member>();

	const columns = [
		accessor("user", {
			header: "User",
			cell: (info) => (
				<div className="flex items-center">
					<img
						className="w-10 h-10 rounded-full"
						src={info.getValue().image ?? ""}
						alt=""
					/>
					<span className="ml-3 text-sm font-medium text-gray-900">
						{info.getValue().email}
					</span>
				</div>
			),
		}),
		accessor("role", {
			header: "Role",
			cell: (info) => (
				<span className="px-2 py-1 border bg-slate-50 border-slate-300 text-slate-900 ">
					{info.getValue()}
				</span>
			),
		}),
	];
	const table = useReactTable({
		data: members,
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
