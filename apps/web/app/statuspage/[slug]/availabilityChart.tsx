import * as HoverCard from "@radix-ui/react-hover-card";
import { EndpointData, MetricsOverTime } from "./types";
import { Stats } from "@/components/stats";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import classNames from "classnames";
import { AwsLambda } from "@/components/icons/AwsLambda";
import { VercelEdge } from "@/components/icons/VercelEdge";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Fly } from "@/components/icons/Fly";
import { Line } from "@ant-design/plots";
import { AreaChart, LineChart } from "@tremor/react";
function format(n: number): string {
  return Intl.NumberFormat(undefined).format(Math.round(n));
}

type Props = {
  days: number;
  max: number;
  height?: string;
  endpoint: EndpointData;
  degradedAfter?: number;
};

type TableData = {
  region: {
    id: string;
    name: string;
  };
  p75: number;
  p90: number;
  p95: number;
  p99: number;
  errors: number;
  count: number;
  series: MetricsOverTime;
};
export const AvailabilityChart: React.FC<Props> = ({
  max,
  height,
  days,
  endpoint,
  degradedAfter,
}) => {
  const [expanded, setExpanded] = useState(false);

  const t = new Date();
  t.setUTCHours(0, 0, 0, 0);

  const global = endpoint.regions["global"];

  return (
    <div className="w-full">
      <div className={`flex w-full bg-white ${height ?? "h-12"} items-end`}>
        {global.series.slice(-days).map((bucket) => {
          const start = new Date(bucket.time);
          const percentageHeight = bucket.p75 >= 0 ? Math.max(5, (bucket.p75 / max) * 100) : 100;
          const bucketError = bucket.errors > 0;
          const bucketDegraded = degradedAfter && bucket.p75 > degradedAfter;

          const cn = [
            "flex-1 rounded-sm border border-white transition-all duration-150 px-px hover:scale-110 py-1 ",
          ];

          if (bucket.p75 < 0) {
            cn.push("  bg-zinc-400/20 hover:bg-zinc-400/50 ");
          } else if (bucketError) {
            cn.push(" bg-red-500  ");
          } else if (bucketDegraded) {
            cn.push(" bg-yellow-400  ");
          } else {
            cn.push(" bg-emerald-500 ");
          }

          return (
            <HoverCard.Root openDelay={50} closeDelay={40} key={bucket.time}>
              <HoverCard.Trigger
                className={cn.join(" ")}
                style={{
                  height: `${percentageHeight}%`,
                }}
              />
              <HoverCard.Portal>
                <HoverCard.Content>
                  <>
                    {bucket.p75 >= 0 ? (
                      <>
                        <div className="px-4 py-5 overflow-hidden bg-white rounded-sm shadow sm:p-6">
                          <time
                            dateTime={start.toISOString()}
                            className="text-xl font-medium text-center truncate text-zinc-900"
                          >
                            {start.toDateString()}
                          </time>
                          <dt className="text-sm font-medium truncate text-zinc-500" />
                          <div>
                            <dl className="grid grid-cols-1 gap-2 mt-5 md:grid-cols-3 lg:grid-cols-6 ">
                              <Stats label="Checks" value={format(bucket.count)} />
                              <Stats label="P75" value={format(bucket.p75)} suffix="ms" />
                              <Stats label="P90" value={format(bucket.p90)} suffix="ms" />
                              <Stats label="P95" value={format(bucket.p95)} suffix="ms" />
                              <Stats label="P99" value={format(bucket.p99)} suffix="ms" />
                              <Stats label="Errors" value={format(bucket.errors)} />
                            </dl>
                          </div>
                        </div>
                        <HoverCard.Arrow />
                      </>
                    ) : null}
                  </>
                </HoverCard.Content>
              </HoverCard.Portal>
            </HoverCard.Root>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs font-medium text-zinc-500">90 Days ago</span>
        <button
          className="flex items-center gap-1 text-xs duration-150 text-zinc-500 hover:text-zinc-800"
          onClick={() => setExpanded(!expanded)}
        >
          <span>Show details</span>{" "}
          <ChevronDown
            className={classNames("w-4 h-4 transition-all duration-150", {
              "rotate-180": expanded,
            })}
          />
        </button>
        <span className="text-xs font-medium text-zinc-500">Today</span>
      </div>
      {expanded ? <Expanded endpoint={endpoint} /> : null}
    </div>
  );
};

const Latency: React.FC<{ value: number }> = ({ value }) => {
  return <span className="text-xs text-zinc-700 whitespace-nowrap">{format(value)} ms</span>;
};

const Expanded: React.FC<{ endpoint: EndpointData }> = ({ endpoint }) => {
  const { accessor } = createColumnHelper<TableData>();

  const columns = [
    accessor("region", {
      header: "Region",
      cell: (info) => info.getValue().name,
    }),

    accessor("p75", {
      header: "P75",
      cell: (info) => <Latency value={info.getValue()} />,
    }),
    accessor("p90", {
      header: "P90",

      cell: (info) => <Latency value={info.getValue()} />,
    }),

    accessor("p95", {
      header: "P95",

      cell: (info) => <Latency value={info.getValue()} />,
    }),
    accessor("p99", {
      header: "P99",

      cell: (info) => <Latency value={info.getValue()} />,
    }),

    accessor("series", {
      header: "",

      cell: (info) => (
        <div className="h-8 w-auto">
          <Line
            padding={[4, 0, 4, 4]}
            autoFit={true}
            data={info
              .getValue()
              .filter((s) => s.time >= 0)
              .map((s) => ({
                time: new Date(s.time).toDateString(),
                p75: s.p75,
              }))}
            animation={false}
            yField="p75"
            xField="time"
            smooth={true}
            color={(datum) => {
              console.log({ datum });
              return "#3366FF";
            }}
            xAxis={false}
            yAxis={false}
            lineStyle={{
              lineWidth: 1.5,
            }}
            tooltip={{
              formatter: (datum) => ({
                name: "P75 Latency",
                value: `${datum.p75 >= 0 ? Intl.NumberFormat().format(datum.p75) : "N/A"} ms`,
              }),
            }}
          />
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: Object.values(endpoint.regions)
      .filter((r) => r.id !== "global")
      .map((region) => ({
        region: {
          id: region.id,
          name: region.name,
        },
        p75: region.p75,
        p90: region.p90,
        p95: region.p95,
        p99: region.p99,
        errors: region.errors,
        count: region.count,
        series: region.series,
      })),
    columns,

    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="min-w-full mt-2 border-separate" style={{ borderSpacing: 0 }}>
      <thead className="sticky">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header, i) => (
              <th
                key={header.id}
                className={classNames("z-10  py-2  text-sm font-medium text-zinc-700", {
                  "text-left pr-4": i === 0,
                  "text-right px-4": i > 0,
                })}
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
            {row.getVisibleCells().map((cell, j) => (
              <td
                key={cell.id}
                className={classNames("whitespace-nowrap text-zinc-500", {
                  "text-left pr-4": j === 0,
                  "text-right px-4": j > 0 && j < row.getVisibleCells().length - 1,
                  "text-right pl-4": j === row.getVisibleCells().length - 1,
                  "border-t border-zinc-100": i > 0,
                  "hidden  lg:block min-w-full": cell.column.id === "series",
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
  );
};
