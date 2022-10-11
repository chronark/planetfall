import { Layout } from "components/app/layout/nav";
import { useSession, useUser } from "components/auth";
import { useRouter } from "next/router";
import { trpc } from "../../../../lib/hooks/trpc";
import { Area, Line } from "@ant-design/plots";
import ms from "ms"

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
  MinusIcon,
} from "@heroicons/react/24/solid";
import { Heading } from "components/heading";

const RegionTab: React.FC<
  { endpointId: string; regionId: string; regionName: string }
> = (
  { endpointId, regionId, regionName },
): JSX.Element => {
    const now = useMemo(() => Date.now(), []);
    const ctx = trpc.useContext();
    const [since, setSince] = useState(now - 60 * 60 * 1000);
    const endpoint = trpc.endpoint.get.useQuery({ endpointId }, {
      enabled: !!endpointId,
    });

    const checks = trpc.check.list.useQuery({ endpointId, since, regionId }, {
      enabled: !!endpointId,
    });

    const annotations: Annotation[] = [];
    if (endpoint.data?.degradedAfter) {
      annotations.push(
        {
          type: "regionFilter",
          start: ["min", endpoint.data.degradedAfter],
          end: ["max", "max"],
          color: "#f59e0b",
        },
        {
          type: "line",
          text: {
            content: "Degraded",
          },
          start: ["min", endpoint.data.degradedAfter],
          end: ["max", endpoint.data.degradedAfter],
          style: {
            stroke: "#f59e0b",
            lineDash: [8, 8],
          },
        },
      );
    }

    const latencies = useMemo(
      () =>
        (checks.data ?? []).filter((c) => typeof c.latency === "number").map(
          (c) => c.latency,
        ) as number[],
      [checks.data],
    );

    const p50 = usePercentile(
      0.50,
      latencies,
    );
    const p95 = usePercentile(
      0.95,
      latencies,
    );
    const p99 = usePercentile(
      0.99,
      latencies,
    );

    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <Typography.Title level={3}>
          {regionName}
        </Typography.Title>

        <Row justify="end">
          <Space size="large">
            <Col span={1 / 3}>
              <Typography.Text>
                p50: <Typography.Text strong>{p50}</Typography.Text> ms
              </Typography.Text>
            </Col>
            <Col span={1 / 3}>
              <Typography.Text>
                p95: <Typography.Text strong>{p95}</Typography.Text> ms
              </Typography.Text>
            </Col>

            <Col span={1 / 3}>
              <Typography.Text>
                p99: <Typography.Text strong>{p99}</Typography.Text> ms
              </Typography.Text>
            </Col>
            <Segmented
              value={since}
              options={[
                {
                  label: "1m",
                  value: now - 60 * 1000,
                },
                {
                  label: "15m",
                  value: now - 15 * 60 * 1000,
                },
                {
                  label: "1h",
                  value: now - 60 * 60 * 1000,
                },
                {
                  label: "3h",
                  value: now - 3 * 60 * 60 * 1000,
                },
                {
                  label: "6h",
                  value: now - 6 * 60 * 60 * 1000,
                },
                {
                  label: "24h",
                  value: now - 24 * 60 * 60 * 1000,
                },
              ]}
              onChange={(v) => {
                setSince(parseInt(v.toString()));
              }}
            />
            <Button
              disabled={!endpoint.isStale}
              icon={<ReloadOutlined />}
              loading={endpoint.isFetching || endpoint.isLoading}
              onClick={() => {
                ctx.endpoint.get.invalidate();
              }}
            >
            </Button>
          </Space>
        </Row>
        <Line
          data={(checks.data ?? []).map((c) => ({
            time: c.time.toLocaleString(),
            latency: c.latency,
          }))}
          padding="auto"
          xField="time"
          yField="latency"
          smooth
          color="#3366FF"
          autoFit={true}
          legend={{
            position: "bottom",
          }}
          annotations={annotations}
          yAxis={{
            title: { text: "Latency [ms]" },
            tickCount: 3,
          }}
          xAxis={{
            tickCount: 10,
            label: {
              formatter: (text) => new Date(text).toLocaleTimeString(),
            },
          }}
          tooltip={{
            title: (d) => new Date(d).toLocaleString(),
          }}
        />
      </Space>
    );
  };

type Series = ({
  buffer: true;
} | {
  buffer: false;
  time: Date;
  latency: number | null;
  region?: string;
  error?: string;
})[];

const Main: React.FC<{ endpointId: string; teamSlug: string }> = (
  { endpointId, teamSlug },
): JSX.Element => {
  const router = useRouter();
  const now = useMemo(() => Date.now(), []);
  const ctx = trpc.useContext();
  const [since, setSince] = useState(now - 60 * 60 * 1000);
  const deleteEndpoint = trpc.endpoint.delete.useMutation();
  const updateEndpoint = trpc.endpoint.update.useMutation({
    onSettled: () => ctx.endpoint.get.invalidate(),
  });
  const endpoint = trpc.endpoint.get.useQuery({ endpointId }, {
    staleTime: 10000,
  });

  const checks = trpc.check.list.useQuery({
    since: now - ms("24h"),
    endpointId,
  }, {
    enabled: !!endpointId,
    staleTime: endpoint.data?.interval ? endpoint.data.interval : undefined,
    refetchInterval: endpoint.data?.interval
      ? endpoint.data.interval
      : undefined,
  });

  const latencies = useMemo(
    () =>
      (checks.data ?? []).filter((c) => typeof c.latency === "number").map(
        (c) => c.latency,
      ) as number[],
    [checks.data],
  );

  const p50 = usePercentile(
    0.50,
    latencies,
  );
  const p95 = usePercentile(
    0.95,
    latencies,
  );
  const p99 = usePercentile(
    0.99,
    latencies,
  );

  const errors = (checks.data ?? []).filter((d) => d.error).length;
  const availability = checks.data ? 1 - errors / checks.data.length : 1;
  const degraded = checks.data
    ? (endpoint.data?.degradedAfter
      ? (checks.data ?? []).filter((d) =>
        d.latency && d.latency >= endpoint.data.degradedAfter!
      ).length
      : 0) / checks.data.length
    : 1;

  return (
    <>
      <PageHeader
        title={endpoint.data?.name ?? ""}
        description={endpoint.data?.url}
        actions={[
          endpoint.data?.active
            ? (
              <div className="flex h-6 w-6 items-center justify-center mr-2">
                <span className="animate-ping-slow absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 opacity-50">
                </span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500">
                </span>
              </div>
            )
            : (
              <div className="flex h-6 w-6 items-center justify-center mr-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500">
                </span>
              </div>
            ),

          <Button
            key="update"
            type="secondary"
            disabled={!endpoint.data}
            onClick={async () => {
              await updateEndpoint.mutateAsync({
                endpointId,
                teamSlug,
                active: !endpoint.data!.active,
              });
            }}
          >
            {endpoint.data?.active ? "Active" : "Paused"}
          </Button>,
          <Confirm
            key="delete"
            title="Delete Endpoint?"
            description={endpoint.data?.name ?? endpoint.data?.url}
            onConfirm={async () => {
              await deleteEndpoint.mutateAsync({ endpointId });
              router.push(`/${teamSlug}/endpoints`);
              message.success("Endpoint deleted");
            }}
            trigger={<Button type="secondary">Delete</Button>}
          />,
          <Button
            key="settings"
            type="secondary"
            href={`/${teamSlug}/endpoints/${endpointId}/settings`}
          >
            Settings
          </Button>,
        ]}
      />

      <div className="w-full flex justify-between items-center gap-2 md:gap-4 lg:gap-8">
        <Stats
          label="Availability"
          status={availability > 0.99
            ? undefined
            : availability >= 0.95
              ? "warn"
              : "error"}
          value={(availability * 100).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
          suffix="%"
        />
        <Stats
          label="Degraded"
          status={degraded <= 0.01
            ? "success"
            : degraded <= 0.05
              ? "warn"
              : "error"}
          value={(degraded * 100).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
          suffix="%"
        />
        <Stats
          label="Errors"
          status={errors > 0 ? "error" : undefined}
          value={errors.toLocaleString()}
        />
        <Stats
          label="P50"
          status={endpoint.data?.degradedAfter
            ? p50 >= endpoint.data.degradedAfter ? "warn" : undefined
            : undefined}
          value={p50.toLocaleString()}
          suffix="ms"
        />
        <Stats
          label="P95"
          status={endpoint.data?.degradedAfter
            ? p95 >= endpoint.data.degradedAfter ? "warn" : undefined
            : undefined}
          value={p95.toLocaleString()}
          suffix="ms"
        />
        <Stats
          label="P99"
          status={endpoint.data?.degradedAfter
            ? p99 >= endpoint.data.degradedAfter ? "warn" : undefined
            : undefined}
          value={p99.toLocaleString()}
          suffix="ms"
        />
      </div>
    </>
  );
};

const Errors: React.FC<{ endpointId: string }> = (
  { endpointId },
): JSX.Element => {
  const since = useMemo(() => Date.now() - 20 * 60 * 1000, []);
  const endpoint = trpc.endpoint.get.useQuery({ endpointId });
  const checks = trpc.check.list.useQuery({ endpointId, since });
  const regions = trpc.region.list.useQuery();
  console.log({endpoint})
  const { accessor } = createColumnHelper<Check>();

  const failed = (checks.data ?? []).filter((c) => c.error).map((c) => ({
    ...c,
    error: c.error ?? "Degraded Performance",
  }));

  const columns = [
    accessor("time", {
      header: "Time",
      cell: (info) => info.getValue().toLocaleString(),
    }),

    accessor("status", {
      header: "Status",
      cell: (info) => (
        <span className="px-2 py-0.5 bg-slate-50 border-slate-200 rounded border">
          {info.getValue()}
        </span>
      ),
    }),
    accessor("error", {
      header: "Error",
    }),
    accessor("latency", {
      header: "Latency",
      cell: (info) =>
        endpoint.data?.degradedAfter &&
          info.getValue()! >= endpoint.data.degradedAfter
          ? (
            <span className="px-1 bg-amber-50 text-amber-500 rounded">
              {info.getValue()!.toLocaleString()} ms
            </span>
          )
          : info.getValue(),
    }),

    accessor("regionId", {
      header: "Region",
      cell: (info) =>
        regions.data?.find((r) => r.id === info.getValue())?.name ??
        info.getValue(),
    }),
  ];
  const table = useReactTable({
    data: failed.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(
      0,
      10,
    ),
    columns,

    getCoreRowModel: getCoreRowModel(),
  });

  if (failed.length === 0) {
    return (
      <div>
        <p className="text-slate-700  ">There are no failed checks yet</p>
      </div>
    );
  }
  return (
    <table className="min-w-full border-separate" style={{ borderSpacing: 0 }}>
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
                    "rounded-r border-r ": i + 1 === headerGroup.headers.length,
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
  );
};

type FeedProps = {
  endpointId: string;
};
const Feed: React.FC<FeedProps> = ({ endpointId }): JSX.Element => {
  const endpoint = trpc.endpoint.get.useQuery({ endpointId });
  const res = trpc.check.list.useQuery({ endpointId, take: 10, order: "desc" });
  const regions = trpc.region.list.useQuery();
  const { accessor } = createColumnHelper<Check>();

  const checks = res.data ?? [];

  const columns = [
    accessor("error", {
      header: "Success",
      cell: (info) =>
        info.getValue()
          ? (
            <div className="flex h-6 w-6 items-center justify-center mr-2">
              <span className="animate-ping-slow absolute inline-flex h-4 w-4 rounded-full bg-rose-400 opacity-50">
              </span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500">
              </span>
            </div>
          )
          : (
            <div className="flex h-6 w-6 items-center justify-center mr-2">
              <span className="absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 opacity-50">
              </span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500">
              </span>
            </div>
          ),
    }),
    accessor("time", {
      header: "Time",
      cell: (info) => Date.now() - info.getValue().getTime() > 60 * 60 * 1000 ? info.getValue().toLocaleString() : ms(Date.now() - info.getValue().getTime(), { long: true }) + " ago",
    }),

    accessor("status", {
      header: "Status",
      cell: (info) => (
        <span className="px-2 py-0.5 bg-slate-50 border-slate-200 rounded border">
          {info.getValue()}
        </span>
      ),
    }),
    accessor("error", {
      header: "Error",
      cell: (
        info,
      ) => (info.getValue() ?? (
        <MinusIcon className="w-4 h-4 text-slate-400" />
      )),
    }),
    accessor("latency", {
      header: "Latency",
      cell: (info) => (
        <span
          className={`px-1 ${endpoint.data?.degradedAfter &&
            info.getValue()! >= endpoint.data.degradedAfter
            ? "bg-amber-50 text-amber-500 rounded"
            : ""
            }`}
        >
          {info.getValue()!.toLocaleString()} ms
        </span>
      ),
    }),

    accessor("regionId", {
      header: "Region",
      cell: (info) =>
        regions.data?.find((r) => r.id === info.getValue())?.name ??
        info.getValue(),
    }),
  ];
  const table = useReactTable({
    data: checks.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(
      0,
      10,
    ),
    columns,

    getCoreRowModel: getCoreRowModel(),
  });

  if (checks.length === 0) {
    return (
      <div>
        <p className="text-slate-700  ">There are no checks yet</p>
      </div>
    );
  }

  return (
    <table className="min-w-full border-separate" style={{ borderSpacing: 0 }}>
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
                    "rounded-r border-r ": i + 1 === headerGroup.headers.length,
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
  );
};

export default function EndpointPage() {
  const router = useRouter();
  const teamSlug = router.query.teamSlug as string;
  const endpointId = router.query.endpointId as string;
  const [breadcrumbs, setBreadcrumbs] = useState([{
    label: endpointId,
    href: `/ ${teamSlug} / endpoints / ${endpointId}`,
  }]);
  const endpoint = trpc.endpoint.get.useQuery({ endpointId }, {
    enabled: !!endpointId,
  });
  const regions = trpc.region.list.useQuery();
  useEffect(() => {
    if (endpoint.data) {
      setBreadcrumbs([{
        label: endpoint.data.name ?? endpoint.data.url,
        href: `/ ${teamSlug} / endpoints / ${endpointId}`,
      }]);
    }
  }, [endpoint.data]);

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <Space
        size={48}
        direction="vertical"
        style={{ width: "100%", marginBottom: 100 }}
      >
        <Main endpointId={endpointId} teamSlug={teamSlug} />
        <Divider />

        <Heading h2>Errors</Heading>

        {endpoint.data ? <Errors endpointId={endpoint.data?.id} /> : null}

        <Divider />

        <Heading h2>Latest Checks</Heading>

        <Feed endpointId={endpointId} />
        <Divider />

        <Heading h2>Latency By Region</Heading>
        <Tabs
          tabPosition="left"
          style={{ height: "50vh" }}
          items={regions.data?.filter((r) =>
            (endpoint.data?.regions)?.find((region) => region.id === r.id)
          ).map((
            region,
          ) => ({
            label: region.name,
            key: region.id,
            children: (
              <div style={{ margin: "0 0 0 3rem" }}>
                <RegionTab
                  endpointId={endpointId}
                  regionId={region.id}
                  regionName={region.name}
                />
              </div>
            ),
          }))}
        />
      </Space>
    </Layout>
  );
}
