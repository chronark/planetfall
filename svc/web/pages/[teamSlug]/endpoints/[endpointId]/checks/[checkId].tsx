import { Layout } from "components/app/layout/nav";
import { useSession, useUser } from "components/auth";
import { useRouter } from "next/router";
import { trpc } from "../../../../../lib/hooks/trpc";
import { Area, Line } from "@ant-design/plots";
import ms from "ms";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Violin } from "@ant-design/plots";

import { Button, Confirm, PageHeader, Stats } from "components";
import {
  Card,
  Checkbox,
  CheckboxOptionType,
  Col,
  Divider,
  message,
  Popconfirm,
  Row,
  Segmented,
  Select,
  Skeleton,
  Space,
  Spin,
  Statistic,
  Switch,
  Tabs,
  Typography,
} from "antd";
import { LoadingOutlined, ReloadOutlined } from "@ant-design/icons";
import React, { useEffect, useMemo, useState } from "react";

import { Annotation } from "@antv/g2plot";
import { usePercentile } from "lib/hooks/percentile";
import type { Check } from "@planetfall/db";
import classNames from "classnames";
import {
  CheckCircleIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  MinusIcon,
} from "@heroicons/react/24/solid";
import { Heading } from "components/heading";

type Timings = {
  dnsStart: number;
  dnsDone: number;
  connectStart: number;
  connectDone: number;
  tlsHandshakeStart: number;
  tlsHandshakeDone: number;
  firstByteStart: number;
  firstByteDone: number;
  transferStart: number;
  transferDone: number;
};

const DNS: React.FC<{ timings: Timings }> = ({ timings }): JSX.Element => {
  const start = Math.min(...Object.values(timings).filter((t) => t > 0));
  const end = Math.max(...Object.values(timings).filter((t) => t > 0));

  console.log(
    JSON.stringify(
      Object.entries(timings).map(([k, v]) => ({ k, v: v - start })),
      null,
      2,
    ),
  );

  return (
    <div className="transition-all duration-500">
      {timings.dnsDone > 0
        ? (
          <div className="flex w-full gap-4 items-center py-1 duration-500 hover:bg-slate-100 rounded">
            <div className="w-1/5 flex text-sm text-slate-500 justify-between whitespace-nowrap ">
              <span>DNS</span>
              <span>
                {(timings.dnsDone - timings.dnsStart).toLocaleString()} ms
              </span>
            </div>
            <div className="w-4/5 flex">
              <div
                style={{
                  width: `${
                    Math.max(1, timings.dnsDone - timings.dnsStart) /
                    (end - start) * 100
                  }%`,
                }}
              >
                <div className="h-1.5 bg-gradient-to-r from-primary-700 to-primary-500 rounded-sm">
                </div>
              </div>
            </div>
          </div>
        )
        : null}

      {timings.connectDone > 0
        ? (
          <div className="flex w-full gap-4 items-center py-1 duration-500 hover:bg-slate-100 rounded">
            <div className="w-1/5 flex text-sm text-slate-500 justify-between whitespace-nowrap ">
              <span>Connection</span>
              <span>
                {(timings.connectDone - timings.connectStart).toLocaleString()}
                {" "}
                ms
              </span>
            </div>
            <div className="w-4/5 flex">
              <div
                style={{
                  width: `${
                    (timings.connectStart - start) / (end - start) * 100
                  }%`,
                }}
              >
              </div>
              <div
                style={{
                  width: `${
                    Math.max(1, timings.connectDone - timings.connectStart) /
                    (end - start) * 100
                  }%`,
                }}
              >
                <div className="h-1.5 bg-gradient-to-r from-primary-700 to-primary-500 rounded-sm">
                </div>
              </div>
            </div>
          </div>
        )
        : null}
      {timings.tlsHandshakeDone > 0
        ? (
          <div className="flex w-full gap-4 items-center py-1 duration-500 hover:bg-slate-100 rounded">
            <div className="w-1/5 flex text-sm text-slate-500 justify-between whitespace-nowrap ">
              <span>TLS</span>
              <span>
                {(timings.tlsHandshakeDone - timings.tlsHandshakeStart)
                  .toLocaleString()} ms
              </span>
            </div>
            <div className="w-4/5 flex">
              <div
                style={{
                  width: `${
                    (timings.tlsHandshakeStart - start) / (end - start) * 100
                  }%`,
                }}
              >
              </div>
              <div
                style={{
                  width: `${
                    Math.max(
                      1,
                      timings.tlsHandshakeDone - timings.tlsHandshakeStart,
                    ) / (end - start) * 100
                  }%`,
                }}
              >
                <div className="h-1.5 bg-gradient-to-r from-primary-700 to-primary-500 rounded-sm">
                </div>
              </div>
            </div>
          </div>
        )
        : null}
      {timings.firstByteDone > 0
        ? (
          <div className="flex w-full gap-4 items-center py-1 duration-500 hover:bg-slate-100 rounded">
            <div className="w-1/5 flex text-sm text-slate-500 justify-between whitespace-nowrap ">
              <span>Waiting for response</span>
              <span>
                {(timings.firstByteDone - timings.firstByteStart)
                  .toLocaleString()} ms
              </span>
            </div>
            <div className="w-4/5 flex">
              <div
                style={{
                  width: `${
                    (timings.firstByteStart - start) / (end - start) * 100
                  }%`,
                }}
              >
              </div>
              <div
                style={{
                  width: `${
                    Math.max(
                      1,
                      timings.firstByteDone - timings.firstByteStart,
                    ) / (end - start) * 100
                  }%`,
                }}
              >
                <div className="h-1.5 bg-gradient-to-r from-primary-700 to-primary-500 rounded-sm">
                </div>
              </div>
            </div>
          </div>
        )
        : null}
      {timings.transferDone > 0
        ? (
          <div className="flex w-full gap-4 items-center py-1 duration-500 hover:bg-slate-100 rounded">
            <div className="w-1/5 flex text-sm text-slate-500 justify-between whitespace-nowrap ">
              <span>Transfer</span>
              <span>
                {(timings.transferDone - timings.transferStart)
                  .toLocaleString()} ms
              </span>
            </div>
            <div className="w-4/5 flex">
              <div
                style={{
                  width: `${
                    (timings.transferStart - start) / (end - start) * 100
                  }%`,
                }}
              >
              </div>
              <div
                style={{
                  width: `${
                    Math.max(
                      1,
                      timings.transferDone - timings.transferStart,
                    ) / (end - start) * 100
                  }%`,
                }}
              >
                <div className="h-1.5 bg-gradient-to-r from-primary-700 to-primary-500 rounded-sm">
                </div>
              </div>
            </div>
          </div>
        )
        : null}
    </div>
  );
};

export default function CheckPage() {
  const router = useRouter();
  const teamSlug = router.query.teamSlug as string;
  const endpointId = router.query.endpointId as string;
  const checkId = router.query.checkId as string;

  const check = trpc.check.get.useQuery({ checkId }, {
    enabled: !!checkId,
  });
  const regions = trpc.region.list.useQuery();

  const [breadcrumbs, setBreadcrumbs] = useState([{
    label: check.data?.endpoint.name ?? check.data?.endpoint.url ?? endpointId,
    href: `/${teamSlug}/endpoints/${endpointId}`,
  }, {
    label: checkId,
    href: `/${teamSlug}/endpoints/${endpointId}/checks/${checkId}`,
  }]);

  const { accessor } = createColumnHelper<{ key: string; value: string }>();

  const columns = [
    accessor("key", {
      header: "Key",
      cell: (info) => <div>{info.getValue()}</div>,
    }),

    accessor("value", {
      header: "Value",
      cell: (info) => <div>{info.getValue()}</div>,
    }),
  ];
  const table = useReactTable({
    data: Object.entries(check.data?.headers ?? {} as Record<string, string>)
      .map(([key, value]) => ({ key, value })),
    columns,

    getCoreRowModel: getCoreRowModel(),
  });

  let body = check.data?.body ? check.data.body : null;
  if (body) {
    try {
      body = JSON.stringify(JSON.parse(body), null, 2);
    } catch {}
  }

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <PageHeader
        sticky
        title={check.data?.id ?? ""}
        description={check.data?.endpoint.url}
      />
      <div className="relative">
        <div className="w-full flex justify-between items-center gap-2 md:gap-4 lg:gap-8">
          <Stats
            label={check.data?.error ? "Error" : "Success"}
            value={check.data?.error
              ? <ExclamationTriangleIcon className="m-1 w-8 h-8" />
              : <CheckIcon className="m-1 w-8 h-8" />}
            status={check.data?.error ? "error" : "success"}
          />
          <Stats
            label={check.data?.time?.toLocaleString() ?? ""}
            value={`${
              check.data?.time ? ms(Date.now() - check.data.time.getTime()) : ""
            }`}
            suffix="ago"
          />
          <Stats
            label="Status"
            value={check.data?.status?.toString() ?? "None"}
          />
          <Stats
            label="Latency"
            value={check.data?.latency?.toLocaleString() ?? "None"}
            status={check.data?.endpoint.degradedAfter && check.data?.latency &&
                check.data.latency >= check.data.endpoint.degradedAfter
              ? "warn"
              : undefined}
            suffix="ms"
          />
          <Stats
            label="Region"
            value={regions.data?.find((r) => r.id === check.data?.regionId)
              ?.name ?? "X"}
          />
        </div>
      </div>
      {check.data?.timing
        ? (
          <>
            <Divider />
            <Heading h2>Trace</Heading>

            <DNS timings={check.data.timing as Timings} />
          </>
        )
        : null}

      <Divider />

      {check.data?.error
        ? (
          <>
            <Heading h2>Error</Heading>
            {check.data?.error}
            <Divider />
          </>
        )
        : null}

      <Heading h2>Response Header</Heading>

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
      <Divider />

      <Heading h2>Response Body</Heading>

      {check.data?.body
        ? (
          <code className="md:px-4 px-2 py-1 md:py-3  w-full flex flex-grow    border rounded">
            {body}
          </code>
        )
        : "None"}
    </Layout>
  );
}
