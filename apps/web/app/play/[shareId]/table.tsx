"use client";

import { AwsLambda } from "@/components/icons/AwsLambda";
import { VercelEdge } from "@/components/icons/VercelEdge";
import { PlayResult } from "@/lib/trpc/routers/play";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";

type Props = {
  regions: PlayResult["regions"];
  urls: PlayResult["urls"];
};

const Cell: React.FC<{ value: (number | string | undefined)[] }> = ({ value }) => {
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

export const Table: React.FC<Props> = ({ regions, urls }) => {
  const fmt = (n: number | undefined) => {
    if (n === undefined) {
      return "N/A";
    }
    return `${Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(n)} ms`;
  };

  const data = regions.map((r) => ({
    region: {
      id: r.id,
      name: r.name,
    },
    latency: r.checks.map((c) => fmt(c?.latency)),
    status: r.checks.map((c) => c.status),
    dns: r.checks.map((c) => (c.timing ? fmt(c.timing.dnsDone - c.timing.dnsStart) : undefined)),
    connect: r.checks.map((c) =>
      c.timing ? fmt(c.timing.connectDone - c.timing.connectStart) : undefined,
    ),
    tls: r.checks.map((c) =>
      c.timing ? fmt(c.timing.tlsHandshakeDone - c.timing.tlsHandshakeStart) : undefined,
    ),
    ttfb: r.checks.map((c) =>
      c.timing ? fmt(c.timing.firstByteDone - c.timing.firstByteStart) : undefined,
    ),
    total: r.checks.map((c) => fmt(c?.latency)),
  }));
  const { accessor } = createColumnHelper<typeof data[0]>();

  let columns = [
    accessor("region", {
      header: "Region",
      cell: (info) => {
        const { id, name } = info.getValue();
        return (
          <div className="flex items-center gap-2">
            {id.startsWith("aws:") ? (
              <AwsLambda className="w-4 h-4" />
            ) : (
              <VercelEdge className="w-4 h-4" />
            )}
            <span>{name}</span>
          </div>
        );
      },
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

  if (data.length > 0 && data[0].latency.length > 1) {
    columns = [
      columns[0],
      accessor("latency", {
        header: "Check",
        cell: (_info) => (
          <div className="flex flex-col items-start gap-1 text-sm font-semibold text-left ">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-sm" /> {urls[0]}
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-sm" /> {urls[1]}
            </div>
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
      <table className="min-w-full border-separate" style={{ borderSpacing: 0 }}>
        <thead className="sticky">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, i) => (
                <th
                  key={header.id}
                  className={classNames(
                    "px-4 z-10    py-3.5  text-sm font-semibold text-zinc-900",
                    {
                      "text-left": regions[0]?.checks.length > 1 ? i <= 1 : i === 0,
                      "text-right": regions[0]?.checks.length > 1 ? i > 1 : i > 0,
                    },
                  )}
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
          {table.getRowModel().rows.map((row, i) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={classNames("px-4 py-2 whitespace-nowrap text-zinc-500", {
                    "border-t border-zinc-100": i > 0,
                  })}
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
                    : flexRender(header.column.columnDef.footer, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
    </div>
  );
};
