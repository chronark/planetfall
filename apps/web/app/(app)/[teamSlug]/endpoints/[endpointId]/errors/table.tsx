"use client";

import React from "react";
import type { Check } from "@planetfall/tinybird";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { ChevronRight, Minus } from "lucide-react";

type ErrorCheck = {
  detailsUrl: string;
  time: number;
  region: string;
  error: string;
  latency?: number;
  status?: number;
};

export type Props = {
  errors: ErrorCheck[];
};

export const ErrorsTable: React.FC<Props> = ({ errors }): JSX.Element => {
  const { accessor } = createColumnHelper<ErrorCheck>();

  const columns = [
    accessor("time", {
      header: "Time",
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    }),

    accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        if (!status) {
          return <Minus className="w-4 h-4 text-zinc-400" />;
        }
        return (
          <span className="px-2 py-0.5 bg-zinc-50 border-zinc-200 rounded border">{status}</span>
        );
      },
    }),
    accessor("error", {
      header: "Error",
    }),
    accessor("latency", {
      header: "Latency",
      cell: (info) => {
        const latency = info.getValue();
        if (!latency) {
          return <Minus className="w-4 h-4 text-zinc-400" />;
        }
        return `${latency.toLocaleString("en")} ms`;
      },
    }),

    accessor("region", {
      header: "Region",
      cell: (info) =>
        // regions.data?.find((r) => r.id === info.getValue())?.name ??
        info.getValue(),
    }),
    accessor("detailsUrl", {
      header: "",
      cell: (info) => (
        <Link href={info.getValue()}>
          <ChevronRight className="duration-150 text-zinc-500 hover:text-zinc-800" />
        </Link>
      ),
    }),
  ];
  const table = useReactTable({
    data: errors.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()),
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="min-w-full border-separate" style={{ borderSpacing: 0 }}>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header, _i) => (
              <th
                key={header.id}
                className="sticky px-3 bg-white z-10  py-3.5 text-left text-sm font-semibold text-zinc-900"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="px-3 py-2 text-sm whitespace-nowrap text-zinc-500">
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
                  : flexRender(header.column.columnDef.footer, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </tfoot>
    </table>
  );
};
