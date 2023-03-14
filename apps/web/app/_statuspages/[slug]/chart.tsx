"use client";

import * as HoverCard from "@radix-ui/react-hover-card";
import { useState } from "react";
import { Stats } from "@/components/stats";
import { Heading } from "@/components/heading";
import { ChevronDown } from "lucide-react";
import { CardContent, CardHeader, Card } from "@/components/card";
import cn from "classnames";
import { Text } from "@/components/text";
import { Platform } from "@planetfall/db";
import { AwsLambda } from "@/components/icons/AwsLambda";
import { VercelEdge } from "@/components/icons/VercelEdge";
function format(n: number): string {
  return Intl.NumberFormat(undefined).format(Math.round(n));
}

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  return (
    <div className="flex items-center space-x-1 text-xs text-zinc-700 whitespace-nowrap">
      <span className="font-semibold">{label}:</span>
      <span className="">{format(value)} ms</span>
    </div>
  );
};

/**
 * Trims the series to the last nBuckets and fills in the gaps with 0s
 */
function resizeSeries(
  series: {
    time: number;
    regionId: string;
    count: number;
    errors: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  }[],
  nBuckets: number,
  regionId: string,
) {
  series = series
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    .slice(-nBuckets);
  while (series.length < nBuckets) {
    series.unshift({
      regionId,
      time: -1,
      count: 0,
      p75: 0,
      p90: 0,
      p95: 0,
      p99: 0,
      errors: 0,
    });
  }

  return series;
}

export const Row: React.FC<{
  nBuckets?: number;
  endpoint: {
    id: string;
    name: string;
    url: string;
    degradedAfter?: number;
    timeout?: number;
    stats: {
      region: {
        id: string;
        name: string;
        platform: Platform;
      };
      series: {
        time: number;
        regionId: string;
        count: number;
        errors: number;
        p75: number;
        p90: number;
        p95: number;
        p99: number;
      }[];
      metrics: {
        regionId: string;
        count: number;
        errors: number;
        p75: number;
        p90: number;
        p95: number;
        p99: number;
      };
    }[];
  };
}> = ({ endpoint, nBuckets = 90 }): JSX.Element => {
  const [expanded, setExpanded] = useState(false);

  const globalStats = endpoint.stats.find((s) => s.region.id === "global");
  const totalChecks = globalStats?.metrics.count ?? 0;
  const errors = globalStats?.metrics.errors ?? 0;
  const availability = totalChecks === 0 ? 1 : 1 - errors / totalChecks;

  const current =
    globalStats?.series.at(-1) && globalStats?.series.at(-1)!.errors > 0
      ? "Error"
      : endpoint.degradedAfter &&
        globalStats?.series.at(-1) &&
        globalStats?.series.at(-1)!.p99 > endpoint.degradedAfter
      ? "Degraded"
      : "Operational";

  for (let i = 0; i < endpoint.stats.length; i++) {
    endpoint.stats[i].series = resizeSeries(
      endpoint.stats[i].series,
      nBuckets,
      endpoint.stats[i].region.name,
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full gap-4 md:gap-8">
          <div className="flex flex-col items-start justify-between w-full gap-2 md:items-center md:flex-row">
            <Heading h3>{endpoint.name}</Heading>
            <div className="flex items-center justify-start gap-2 md:gap-4">
              <Stat label="p75" value={globalStats?.metrics.p75 ?? 0} />
              <Stat label="p90" value={globalStats?.metrics.p90 ?? 0} />
              <Stat label="p95" value={globalStats?.metrics.p95 ?? 0} />
              <Stat label="p99" value={globalStats?.metrics.p99 ?? 0} />
            </div>
          </div>

          <div className="flex flex-col-reverse items-end gap-4 md:items-center md:flex-row">
            <Text size="sm" lineBreak={false}>
              {(availability * 100).toFixed(2)} % Availability
            </Text>

            <div className="flex items-center gap-2 px-3 py-1 border rounded-full border-zinc-300">
              <div
                className={cn("w-2.5 h-2.5 rounded-full", {
                  "bg-emerald-500": current === "Operational",
                  "bg-yellow-500": current === "Degraded",
                  "bg-red-500": current === "Error",
                })}
              />
              <span className="text-sm font-medium">{current}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col -mt-4 space-y-2">
          <div className="sm:hidden">
            <Chart
              withXAxis
              series={resizeSeries(globalStats?.series ?? [], 30, "global")}
              degradedAfter={endpoint.degradedAfter}
              timeout={endpoint.timeout}
            />
          </div>
          <div className="hidden sm:block md:hidden">
            <Chart
              withXAxis
              series={resizeSeries(globalStats?.series ?? [], 60, "global")}
              degradedAfter={endpoint.degradedAfter}
              timeout={endpoint.timeout}
            />
          </div>
          <div className="hidden md:block">
            <Chart
              withXAxis
              series={resizeSeries(globalStats?.series ?? [], 90, "global")}
              degradedAfter={endpoint.degradedAfter}
              timeout={endpoint.timeout}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 py-2 mt-2 md:gap-8">
          <button
            className="flex items-center gap-1 text-sm duration-150 text-zinc-500 hover:text-zinc-800"
            onClick={() => setExpanded(!expanded)}
          >
            <span>Show details</span>{" "}
            <ChevronDown
              className={cn("w-4 h-4 transition-all duration-150", {
                "rotate-180": expanded,
              })}
            />
          </button>
        </div>

        {expanded ? (
          <ul className="flex flex-col gap-4 py-8 divide-y divide-zinc-200">
            {endpoint.stats
              .filter(({ region }) => region.id !== "global")
              .map((r) => (
                <li
                  key={r.region.id}
                  className="flex flex-col items-center justify-between w-full gap-4 p-2 md:flex-row "
                >
                  <div className="flex flex-col items-center justify-between space-y-2 md:items-start md:w-2/5">
                    <h4 className="flex items-center gap-2 text-lg text-bold text-zinc-600 whitespace-nowrap">
                      {r.region.platform === "aws" ? (
                        <AwsLambda className="w-4 h-4" />
                      ) : r.region.platform === "vercelEdge" ? (
                        <VercelEdge className="w-4 h-4" />
                      ) : null}
                      {r.region.name}
                    </h4>
                    <div className="flex items-center justify-center w-full gap-2 md:justify-start sm:gap-4 ">
                      <Stat label="p75" value={r.metrics.p75} />
                      <Stat label="p90" value={r.metrics.p90} />
                      <Stat label="p95" value={r.metrics.p95} />
                      <Stat label="p99" value={r.metrics.p99} />
                    </div>
                  </div>
                  <div className="w-full md:w-3/5">
                    <div className="sm:hidden">
                      <Chart
                        height="h-12"
                        series={resizeSeries(r.series, 30, r.region.id)}
                        degradedAfter={endpoint.degradedAfter}
                        timeout={endpoint.timeout}
                      />
                    </div>
                    <div className="hidden sm:block md:hidden">
                      <Chart
                        height="h-12"
                        series={resizeSeries(r.series, 60, r.region.id)}
                        degradedAfter={endpoint.degradedAfter}
                        timeout={endpoint.timeout}
                      />
                    </div>
                    <div className="hidden md:block">
                      <Chart
                        height="h-12"
                        series={resizeSeries(r.series, 90, r.region.id)}
                        degradedAfter={endpoint.degradedAfter}
                        timeout={endpoint.timeout}
                      />
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
};

const Chart: React.FC<{
  height?: string;
  series: {
    time: number;
    regionId: string;
    count: number;
    errors: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  }[];
  degradedAfter?: number;
  timeout?: number;
  withXAxis?: boolean;
}> = ({ series, height, degradedAfter, withXAxis }): JSX.Element => {
  const p99 = Math.max(...series.map((m) => m.p99));
  let t = new Date();
  t.setMinutes(0);
  t.setSeconds(0);
  t.setMilliseconds(0);

  return (
    <div className="w-full">
      <div className={`flex w-full bg-white ${height ?? "h-12"} items-end`}>
        {series

        .map((bucket, _i) => {
          const start = new Date(bucket.time);

          const percentageHeight = bucket.time >= 0 ? Math.max(5, (bucket.p99 / p99) * 100) : 100;
          const bucketError = bucket.errors > 0;
          const bucketDegraded = degradedAfter && bucket.p99 > degradedAfter;
          // ? p99 > endpoint.degradedAfter
          // : 0;
          const cn = [
            "flex-1 rounded-sm border border-white transition-all duration-150 px-px hover:scale-110 py-1 ",
          ];

          if (bucket.time < 0) {
            cn.push("  bg-zinc-400/20 hover:bg-zinc-400/50 ");
          } else if (bucketError) {
            cn.push(" bg-red-500  ");
          } else if (bucketDegraded) {
            cn.push(" bg-yellow-400  ");
          } else {
            cn.push(" bg-emerald-400 ");
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
                    {bucket.time >= 0 ? (
                      <>
                        <div className="px-4 py-5 overflow-hidden bg-white rounded-sm shadow sm:p-6">
                          <time
                            dateTime={start.toISOString()}
                            className="text-xl font-medium text-center truncate text-zinc-900"
                          >
                            {start.toLocaleDateString()}
                          </time>
                          <dt className="text-sm font-medium truncate text-zinc-500" />
                          <dt className="text-sm font-medium truncate text-zinc-500">
                            {/* {bucket.region} */}
                          </dt>
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
      {withXAxis ? (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs font-medium text-zinc-500">{series.length} Days ago</span>
          <span className="text-xs font-medium text-zinc-500">Today</span>
        </div>
      ) : null}
    </div>
  );
};
