import { Layout } from "../../../components/app/layout/nav";
import { useSession, useUser } from "components/auth";
import { useRouter } from "next/router";
import { trpc } from "../../../lib/hooks/trpc";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Confirm, PageHeader } from "components";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useMemo } from "react";
import { Endpoint, StatusPage } from "@planetfall/db";
import { usePercentile } from "@planetfall/svc/web/lib/hooks/percentile";
import classNames from "classnames";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { imageConfigDefault } from "next/dist/shared/lib/image-config";

export default function Pagespage() {
  useSession();
  const { user } = useUser();

  const router = useRouter();
  const breadcrumbs = user?.name ? [] : [];
  const teamSlug = router.query.teamSlug as string;
  const pages = trpc.page.list.useQuery({
    teamSlug,
  }, {
    enabled: !!teamSlug,
  });
  const ctx = trpc.useContext();
  const deleteStatusPage = trpc.page.delete.useMutation({
    onSettled: () => ctx.page.list.invalidate(),
  });

  const protocol = process.env.NEXT_PUBLIC_VERCEL_ENV ? "https" : "http";
  const host = process.env.NEXT_PUBLIC_VERCEL_ENV
    ? "planetfall.io"
    : "localhost:3000";
  const { accessor } = createColumnHelper<
    StatusPage & { endpoints: Endpoint[] }
  >();

  const columns = [
    accessor("name", {
      header: "Name",
    }),
    accessor("slug", {
      header: "Url",
      cell: (info) => (
        <Link
          className="text-slate-800 hover:text-primary-500"
          href={`${protocol}://${info.getValue()}.${host}`}
        >
          {`${info.getValue()}.${host}`}
        </Link>
      ),
    }),

    accessor("endpoints", {
      header: "Endpoints",
      cell: (info) => (
        <div>
          {info.getValue().length > 3
            ? (
              <span className="px-2 py-1 rounded text-slate-700 bg-slate-50 border border-slate-300">
                3
              </span>
            )
            : info.getValue().map((endpoint, index) => (
              <Link
                href={`/${teamSlug}/endpoints/${endpoint.id}`}
                className="border border-slate-300 bg-slate-50 rounded px-2 py-1 text-slate-800 hover:bg-white duration-300"
                key={index}
              >
                {endpoint.name}
              </Link>
            ))}
        </div>
      ),
    }),
    accessor("id", {
      header: "",
      cell: (info) => (
        <Confirm
          key="delete"
          title="Delete Status Page?"
          description={`${info.row.getValue("slug")}.${host}`}
          onConfirm={async () => {
            await deleteStatusPage.mutateAsync({ pageId: info.getValue() });
          }}
          trigger={
            <div>
              <Button type="secondary">Delete</Button>
            </div>
          }
        />
      ),
    }),
  ];
  const table = useReactTable({
    data: pages.data ?? [],
    columns,

    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <Layout breadcrumbs={breadcrumbs}>
      <PageHeader
        title="Status Pages"
        description="Status pages are publicly accessible pages that you can use to share the status of your services with your customers."
        actions={[
          <Button
            key="settings"
            type="secondary"
            href={`/${teamSlug}/pages/new`}
          >
            Create new
          </Button>,
        ]}
      />

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
                  className={classNames(
                    "whitespace-nowrap px-3 py-2 text-sm text-slate-500",
                    {
                      "text-right": ["id"].includes(cell.column.id),
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
