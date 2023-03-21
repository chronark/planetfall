"use client";

import React from "react";
import { parseCacheControlHeaders, parseXVercelId } from "@planetfall/header-analysis";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Lightbulb } from "lucide-react";
import { Text } from "@/components/text";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialog";
import { Button } from "@/components/button";
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
      cell: (info) => {
        const key = info.getValue();
        const value = info.row.original.value;
        if (key.toLowerCase() === "cache-control") {
          const directives = parseCacheControlHeaders(value);
          if (directives) {
            return (
              <div className="flex items-center gap-2">
                {key}
                <Dialog>
                  <DialogTrigger>
                    <Lightbulb className="w-4 h-4 text-primary-500" />
                  </DialogTrigger>

                  <DialogContent className="flex flex-col gap-2">
                    <DialogHeader>
                      <DialogTitle>Cache-Control</DialogTitle>
                      <DialogDescription>
                        Here is a breakdown of the cache-control header:
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                      {directives.map((d) => (
                        <div key={d.directive} className="flex flex-col items-start gap-1">
                          <Text variant="code">{d.directive}</Text>
                          <Text variant="subtle" size="xs">
                            {d.explanation}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            );
          }
        } else if (key.toLowerCase() === "x-vercel-id") {
          const networkHops = parseXVercelId(value);
          const hopsAlarm =
            networkHops.length > 1 && [...new Set(networkHops.map((h) => h.continent))].length > 1;

          if (networkHops.length >= 2) {
            return (
              <div className="flex items-center gap-2">
                {key}
                <Dialog>
                  <DialogTrigger>
                    <Lightbulb className="w-4 h-4 text-primary-500" />
                  </DialogTrigger>

                  <DialogContent className="flex flex-col gap-2 lg:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Vercel Network Hops</DialogTitle>
                      <DialogDescription>
                        {hopsAlarm ? (
                          <p className="text-sm font-medium text-red-500">
                            This request was routed through multiple continents. This can
                            drastically increase the latency.
                          </p>
                        ) : (
                          <p>This request was routed through the following Vercel regions:</p>
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 overflow-hidden lg:mx-0 lg:max-w-none lg:grid-cols-4">
                      {networkHops.map((hop) => (
                        <div key={hop.regionId}>
                          <div className="flex items-center text-xs font-semibold leading-6 text-zinc-400">
                            <svg
                              viewBox="0 0 4 4"
                              className="mr-4 h-1 w-1 flex-none"
                              aria-hidden="true"
                            >
                              <circle cx={2} cy={2} r={2} fill="currentColor" />
                            </svg>
                            {hop.continent}
                            <div
                              className="absolute -ml-2 h-px w-screen -translate-x-full bg-zinc-900/10 sm:-ml-4 lg:static lg:ml-8 lg:-mr-6 lg:w-auto lg:flex-auto lg:translate-x-0"
                              aria-hidden="true"
                            />
                          </div>
                          <p className="mt-6 text-sm font-semibold leading-8 tracking-tight text-zinc-900">
                            {hop.regionName}
                          </p>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            );
          }
        }
        return key;
      },
    }),

    accessor("value", {
      header: "Value",
      cell: (info) => <span className="break-all">{info.getValue()}</span>,
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
            {headerGroup.headers.map((header, _i) => (
              <th
                key={header.id}
                className="sticky px-3 bg-white z-10   py-3.5 text-left text-sm font-semibold text-zinc-900"
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
