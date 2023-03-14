"use client";

import React from "react";
import type { Check } from "@planetfall/tinybird";
import type { Region } from "@planetfall/db";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import ms from "ms";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Time } from "@/components/time";
import { ChevronRight, Minus } from "lucide-react";
import { Tag } from "@/components/tag";
import { AwsLambda } from "@/components/icons/AwsLambda";
import { Fly } from "@/components/icons/Fly";
import { VercelEdge } from "@/components/icons/VercelEdge";
export type Props = {
  endpointId: string;
  checks: Check[];
  teamSlug: string;
  degradedAfter: number | null;
  timeout: number | null;
  regions: Region[];
};

export const LatestTable: React.FC<Props> = ({
  checks,
  teamSlug,
  degradedAfter,
  timeout,
  regions,
}): JSX.Element => {
  const { accessor } = createColumnHelper<Check>();
  const columns = [
    // accessor("error", {
    // 	header: "Success",
    // 	cell: (info) =>
    // 		info.getValue() ? (
    // 			<div className="flex items-center justify-center w-6 h-6 mr-2">
    // 				<span className="absolute inline-flex w-4 h-4 rounded-full opacity-50 animate-ping-slow bg-rose-400" />
    // 				<span className="relative inline-flex w-2 h-2 rounded-full bg-rose-500" />
    // 			</div>
    // 		) : (
    // 			<div className="flex items-center justify-center w-6 h-6 mr-2">
    // 				<span className="absolute inline-flex w-4 h-4 rounded-full opacity-50 bg-emerald-400" />
    // 				<span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
    // 			</div>
    // 		),
    // }),
    accessor("time", {
      header: "Time",
      cell: (info) => <Time time={info.getValue()} />,
    }),

    accessor("status", {
      header: "Status",
      cell: (info) => (
        <Tag variant="outline" size="sm">
          {info.getValue()}
        </Tag>
      ),
    }),
    accessor("error", {
      header: "Error",
      cell: (info) => info.getValue() ?? <Minus className="w-4 h-4 text-zinc-400" />,
    }),
    accessor("latency", {
      header: "Latency",
      cell: (info) => {
        const latency = info.getValue();
        return (
          <span
            className={classNames({
              "text-amber-500": degradedAfter && latency && latency > degradedAfter,
              "text-red-500": timeout && latency && latency > timeout,
            })}
          >
            {typeof latency === "number" ? (
              `${latency.toLocaleString()} ms`
            ) : (
              <Minus className="w-4 h-4 text-zinc-400" />
            )}
          </span>
        );
      },
    }),

    accessor("regionId", {
      header: "Region",
      cell: (info) => {
        const region = regions.find((r) => r.id === info.getValue());
        if (!region) {
          return info.getValue();
        }
        return (
          <div className="flex items-center gap-2">
            {region.platform === "aws" ? (
              <AwsLambda className="w-4 h-4" />
            ) : region.platform === "fly" ? (
              <Fly className="w-4 h-4" />
            ) : region.platform === "vercelEdge" ? (
              <VercelEdge className="w-4 h-4" />
            ) : null}
            {region.name}
          </div>
        );
      },
    }),
    accessor("id", {
      header: "",
      cell: (info) => (
        <Link href={`/${teamSlug}/checks/${info.getValue()}`}>
          <ChevronRight className="duration-150 text-zinc-500 hover:text-zinc-800" />
        </Link>
      ),
    }),
  ];

  const table = useReactTable({
    data: checks,
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
