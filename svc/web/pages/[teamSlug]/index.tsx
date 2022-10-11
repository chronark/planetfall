import { Layout } from "../../components/app/layout/nav";

import React from "react";
import { useRouter } from "next/router";
import { Card, PageHeader } from "components";
import { Avatar, List, Row, Space, Statistic, Tag, Typography } from "antd";
import { trpc } from "../../lib/hooks/trpc";
import Item from "antd/lib/list/Item";
import { Heading } from "../../components/heading";
import { Text } from "../../components";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Membership, User } from "@planetfall/db";
import classNames from "classnames";

export default function Teampage() {
  const router = useRouter();
  const teamSlug = router.query.teamSlug as string;
  // router.push(router.asPath + "/endpoints");
  const team = trpc.team.get.useQuery({ teamSlug }, { enabled: !!teamSlug });
  const { accessor } = createColumnHelper<Membership & { user: User }>();

  const columns = [
    accessor("user", {
      header: "User",
      cell: (info) => (
        <div className="flex items-center">
          <img
            className="h-10 w-10 rounded-full"
            src={info.getValue().image ?? ""}
            alt=""
          />
          <div className="ml-3 flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {info.getValue().name}
            </span>
            <span className="text-sm text-gray-500">
              {info.getValue().email}
            </span>
          </div>
        </div>
      ),
    }),
    accessor("role", {
      header: "Role",
      cell: (info) => (
        <span className="px-2 py-1 bg-slate-50 border border-slate-300 text-slate-900 ">
          {info.getValue()}
        </span>
      ),
    }),
  ];
  const table = useReactTable({
    data: team.data?.members ?? [],
    columns,

    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Layout breadcrumbs={[]}>
      <PageHeader title={team.data?.name ?? ""} />

      <Heading h4>Team</Heading>

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
                    "sticky px-4 bg-white z-10  border-t border-b border-slate-400  py-3.5 text-left text-sm font-semibold text-slate-900",
                    {
                      "rounded-l border-l": i === 0,
                      "rounded-r border-r ":
                        i + 1 === headerGroup.headers.length,
                    },
                  )}
                >
                  {header.isPlaceholder ? null : flexRender(
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
                  className="whitespace-nowrap px-3 py-2 text-sm text-slate-500"
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
                  {header.isPlaceholder ? null : flexRender(
                    header.column.columnDef.footer,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
    </Layout>
  );
}
