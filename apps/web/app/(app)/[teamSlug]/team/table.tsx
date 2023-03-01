"use client";

import { Tag } from "@/components/tag";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import Image from "next/image";

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
          <Image
            width={64}
            height={64}
            className="w-10 h-10 rounded-full"
            src={info.getValue().image ?? ""}
            alt={`Profile image of ${info.getValue().name}`}
          />
          <span className="ml-3 text-sm font-medium text-zinc-900">{info.getValue().email}</span>
        </div>
      ),
    }),
    accessor("role", {
      header: "Role",
      cell: (info) => (
        <Tag variant="outline" size="sm">
          {info.getValue()}
        </Tag>
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
                  "sticky px-4 bg-white z-10  border-t border-b border-zinc-400  py-3.5 text-left text-sm font-semibold text-zinc-900",
                  {
                    "rounded-l border-l": i === 0,
                    "rounded-r border-r ": i + 1 === headerGroup.headers.length,
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
