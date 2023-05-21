"use client";

import { Button } from "@/components/button";
import { Confirm } from "@/components/confirm";
import { trpc } from "@/lib/trpc";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Page = {
  id: string;
  name: string;
  slug: string;
  endpoints: {
    id: string;
    name: string;
  }[];
};
type Props = {
  teamSlug: string;
  pages: Page[];
};

export const StatuspagesTable: React.FC<Props> = ({ teamSlug, pages }) => {
  const protocol = process.env.NEXT_PUBLIC_VERCEL_URL ? "https" : "http";
  const host = process.env.NEXT_PUBLIC_VERCEL_URL ? "planetfall.io" : "localhost:3000";
  const router = useRouter();

  const { accessor } = createColumnHelper<Page>();

  const columns = [
    accessor("name", {
      header: "Name",
      cell: (info) => <span className="text-sm text-zinc-900">{info.getValue()}</span>,
    }),
    accessor("endpoints", {
      header: "Endpoints",
      cell: (info) => (
        <ul className="flex flex-wrap items-center gap-2">
          {info.getValue().map((endpoint) => (
            <li key={endpoint.id}>
              <Button size="sm" variant="secondary">
                <Link href={`/${teamSlug}/endpoints/${endpoint.id}`}>{endpoint.name}</Link>
              </Button>
            </li>
          ))}
        </ul>
      ),
    }),

    accessor("slug", {
      header: "Link",
      cell: (info) => (
        <Link
          target="_blank"
          className="duration-500 text-zinc-500 hover:text-primary-600 hover:underline"
          href={`${protocol}://${info.getValue()}.${host}`}
        >
          {`${info.getValue()}.${host}`}
        </Link>
      ),
    }),
    accessor("id", {
      header: "",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Button>
            <Link href={`/${teamSlug}/pages/${info.getValue()}/settings`}>Edit</Link>
          </Button>
          <Confirm
            title="Delete page"
            description="Are you sure you want to delete this page?"
            onConfirm={async () => {
              await trpc.page.delete.mutate({ pageId: info.getValue() });
              router.refresh();
            }}
            trigger={<Button variant="danger">Delete</Button>}
          />
        </div>
      ),
    }),
  ];
  const table = useReactTable({
    data: pages,
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
