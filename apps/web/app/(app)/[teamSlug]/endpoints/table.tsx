"use client";

import { Button } from "@/components/button";
import { Metric } from "@planetfall/tinybird";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Endpoint = {
  id: string;
  name: string | null;
  url: string;
  stats: Metric | null;
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
    `${Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(n)} ms`;
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
          <ChevronRight className="duration-150 text-zinc-500 hover:text-zinc-800" />
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
            {headerGroup.headers.map((header, _i) => (
              <th
                key={header.id}
                className="sticky   z-10 px-3  py-3.5 text-left text-sm font-semibold text-zinc-900"
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
