import {
  ChevronDownIcon,
  MinusIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import {
  Check,
  Endpoint as EndpointType,
  PrismaClient,
  Region as RegionType,
  StatusPage,
} from "@planetfall/db";
import * as Collapse from "@radix-ui/react-collapsible";
import * as HoverCard from "@radix-ui/react-hover-card";
import { Divider, Popover } from "antd";
import classNames from "classnames";
import { GetStaticPropsContext } from "next";
import React, { useEffect, useMemo, useState } from "react";
import { percentile, usePercentile } from "../../lib/hooks/percentile";
import { Area, Heatmap, Line, TinyArea } from "@ant-design/plots";
import Link from "next/link";
import { NotFound } from "../../components/notFound/notFound";
import { late, string } from "zod";

import { Button, Stats } from "components";
import { Heading } from "../../components/heading";
import exp from "constants";
export type PageProps = {
  name: string;
  endpoints: {
    name: string | null;
    url: string;
    checks: {
      time: number;
      latency: number | null;
      region: string;
      error?: string;
    }[];
    degradedAfter?: number;
    regions: string[];
  }[];
};

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  return (
    <div className="flex items-center text-sm text-slate-500 space-x-1 whitespace-nowrap">
      <span className="flex-shrink-0 font-semibold">
        {label}:
      </span>
      <span>{value.toLocaleString()} ms</span>
    </div>
  );
};

type Series = {
  time: number;
  latency?: number;
  error?: string;
  region: string;
}[];

const Chart: React.FC<{
  height?: string;
  endpoint: PageProps["endpoints"][0];
  withAvailability?: boolean;
}> = (
  { endpoint, height, withAvailability },
): JSX.Element => {
    const latencies = useMemo(
      () =>
        endpoint.checks.filter((c) => typeof c.latency === "number").map((c) =>
          c.latency
        ) as number[],
      [
        endpoint.checks,
      ],
    );

    const max = useMemo(() => Math.max(...latencies), [latencies]);

    const nBuckets = 72; // 1 hour over 3 days
    // buckets by hour
    // key is the unix timestamp of the start of each hour
    const buckets: Record<string, Series> = {};

    let t = new Date();
    t.setMinutes(0);
    t.setSeconds(0);
    t.setMilliseconds(0);

    for (let i = 0; i < nBuckets; i++) {
      buckets[t.getTime().toString()] = [];
      t = new Date(t.getTime() - 60 * 60 * 1000);
    }

    for (const check of endpoint.checks) {
      const bucketKeyDate = new Date(check.time);
      bucketKeyDate.setMinutes(0);
      bucketKeyDate.setSeconds(0);
      bucketKeyDate.setMilliseconds(0);
      const bucketKey = bucketKeyDate.getTime().toString();

      if (!(bucketKey in buckets)) {
        buckets[bucketKey] = [];
      }
      buckets[bucketKey].push({
        time: check.time,
        latency: check.latency ?? undefined,
        error: check.error,
        region: check.region,
      });
    }


    const errors = endpoint.checks.filter((s) => s.error).length;
    const availability = endpoint.checks.length > 0
      ? 1 - (errors / endpoint.checks.length)
      : 1;
    return (
      <div>
        {withAvailability
          ? (
            <div className="relative mb-2">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div
                  className={classNames("w-full border-t", {
                    "border-emerald-500": availability >= 0.99,
                    "border-orange-500": availability < 0.99 &&
                      availability >= 0.95,
                    "border-rose-500": availability < 0.95,
                  })}
                />
              </div>
              <div className="relative flex justify-center">
                <span
                  className={classNames("bg-white px-2 text-sm", {
                    "text-emerald-500": availability >= 0.99,
                    "text-orange-500": availability < 0.99 &&
                      availability >= 0.95,
                    "text-rose-500": availability < 0.95,
                  })}
                >
                  {(availability * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          )
          : null}
        <div className={`flex space-x-1 ${height ?? "h-12"} items-end`}>
          {Object.entries(buckets).sort((a, b) => parseInt(a[0]) -parseInt(b[0])).map(([time, bucket], i) => {
            const start = new Date(parseInt(time));
            const end = new Date(start.getTime() + 60 * 60 * 1000);
            const latencies = bucket.filter((c) => c.latency).map((c) =>
              c.latency
            ) as number[];
            const p50 = percentile(0.5, latencies);
            const p95 = percentile(0.95, latencies);
            const p99 = percentile(0.99, latencies);
            const height = bucket.length === 0
              ? 100
              : Math.min(1, Math.log(p99) / Math.log(max)) * 100;

            const bucketErrors = bucket.filter((c) => c.error);
            const bucketDegraded = endpoint.degradedAfter
              ? p99 > endpoint.degradedAfter
              : 0;
            const cn = ["flex-1 h-full rounded-sm  transition-all duration-150"];

            if (bucket.length === 0) {
              cn.push(
                "bg-slate-50 border border-slate-300 hover:bg-slate-200 animate-pulse",
              );
            } else if (bucketErrors.length > 0) {
              cn.push("bg-red-400 border border-red-600 hover:bg-red-100");
            } else if (bucketDegraded > 0) {
              cn.push(
                "bg-yellow-300 border border-yellow-500 hover:bg-yellow-100",
              );
            } else {
              cn.push(
                "bg-emerald-300 border border-emerald-500 hover:bg-emerald-100",
              );
            }

            return (
              <HoverCard.Root openDelay={50} closeDelay={40} key={i}>
                <HoverCard.Trigger
                  key={i}
                  className={cn.join(" ")}
                  style={{
                    height: `${height}%`,
                  }}
                />{" "}
                <HoverCard.Portal>
                  <HoverCard.Content>
                    {bucket.length > 0
                      ? (
                        <>
                          <div className="overflow-hidden max-w-xl rounded-sm bg-white px-4 py-5 shadow sm:p-6">
                            <dt className="truncate text-sm font-medium text-slate-500">
                              {start.toLocaleDateString()}
                            </dt>
                            <dt className="truncate text-sm font-medium text-slate-500">
                            </dt>
                            <dt className="truncate text-sm font-medium text-slate-500">
                              {/* {bucket.region} */}
                            </dt>
                            <div>
                              <h3 className="text-lg font-medium leading-6 text-slate-900">
                                {start.toLocaleTimeString()} -{" "}
                                {end.toLocaleTimeString()}
                              </h3>
                              <dl className="mt-5 grid grid-cols-1 md:grid-cols-3 ">
                                {[{ name: "p50", value: p50 }, {
                                  name: "p95",
                                  value: p95,
                                }, { name: "p99", value: p99 }].map((item) => (
                                  <Stats
                                    key={item.name}
                                    label={item.name}
                                    value={item.value.toLocaleString()}
                                    suffix="ms"
                                    status={endpoint.degradedAfter
                                      ? item.value >= endpoint.degradedAfter
                                        ? "warn"
                                        : "success"
                                      : undefined}
                                  />
                                ))}
                              </dl>
                              <Divider />
                              {bucketErrors.length > 0
                                ? (
                                  <div>
                                    <Heading h3>Errors</Heading>
                                    <ul className="divide-y divide-slate-100">
                                      {bucketErrors.map((err, i) => (
                                        <li
                                          key={i}
                                          className="relative bg-white py-3 hover:bg-slate-50 "
                                        >
                                          <div className="flex justify-between space-x-3">
                                            <time
                                              dateTime={new Date(err.time)
                                                .toLocaleString()}
                                              className="truncate text-sm font-medium text-slate-900"
                                            >
                                              {new Date(err.time)
                                                .toLocaleString()}
                                            </time>
                                            <span className="flex-shrink-0 whitespace-nowrap text-sm text-slate-500">
                                              {err.region}
                                            </span>
                                          </div>
                                          <span className="text-sm text-slate-600 line-clamp-2">
                                            {err.error}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )
                                : null}
                            </div>
                          </div>
                          <HoverCard.Arrow />
                        </>
                      )
                      : null}
                  </HoverCard.Content>
                </HoverCard.Portal>
              </HoverCard.Root>
            );
          })}
        </div>
      </div>
    );
  };

const Row: React.FC<
  {
    endpoint: PageProps["endpoints"][0];
  }
> = (
  { endpoint },
): JSX.Element => {
    const latencies = useMemo(
      () =>
        endpoint.checks.filter((c) => typeof c.latency === "number").map((c) =>
          c.latency
        ) as number[],
      [
        endpoint.checks,
      ],
    );

    const min = useMemo(() => Math.min(...latencies), [latencies]);
    const max = useMemo(() => Math.max(...latencies), [latencies]);
    const p50 = usePercentile(0.5, latencies);
    const p95 = usePercentile(0.95, latencies);
    const p99 = usePercentile(0.99, latencies);

    const [expanded, setExpanded] = useState(false);

    return (
      <li className="border-t sm:border border-slate-300 sm:border-slate-100 sm:shadow-ambient md:rounded my-16  hover:border-slate-800 duration-1000">
        <Collapse.Root open={expanded} onOpenChange={setExpanded}>
          <div className="flex-col gap-2 lg:flex-row items-start border-b border-slate-200  px-4 py-5 sm:px-6 flex justify-between md:items-center">
            <div className="lg:w-1/2">
              <span className="text-lg font-medium leading-6 text-slate-900">
                {endpoint.name ?? endpoint.url}
              </span>
            </div>
            <div className="lg:w-1/2 flex gap-2 sm:gap-4 xl:gap-6 justify-between flex-wrap md:flex-nowrap items-center">
              <Stat label="min" value={Math.round(min)} />
              <Stat label="max" value={Math.round(max)} />
              <Stat label="p50" value={Math.round(p50)} />
              <Stat label="p95" value={Math.round(p95)} />
              <Stat label="p99" value={Math.round(p99)} />
            </div>
          </div>

          <div className="p-4 flex flex-col space-y-8">
            <Chart endpoint={endpoint} withAvailability />
            <Collapse.Trigger>
              <div className="relative">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-slate-500 hover:text-primary-500 ">
                    <PlusIcon
                      className={`h-6 w-6 duration-500 ${expanded ? "rotate-45" : ""
                        }`}
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </div>
            </Collapse.Trigger>

            <Collapse.Content>
              <ul className="space-y-4">
                {endpoint.regions.map((region) => {
                  const scopedChecks = endpoint.checks.filter((c) =>
                    c.region === region
                  );

                  return (
                    <li key={region}>
                      <Heading h4>{region}</Heading>

                      <Chart
                        height="h-8"
                        endpoint={{ ...endpoint, checks: scopedChecks }}
                      />
                    </li>
                  );
                })}
              </ul>
            </Collapse.Content>
          </div>
        </Collapse.Root>
      </li>
    );
  };
export default function Page(
  { data }: { data?: PageProps },
) {
  let [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!data) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen relative">
      <header
        className={classNames(
          "md:sticky top-0 z-50 flex flex-wrap items-center justify-between bg-white px-4 py-5 border-b shadow-slate-900/5 transition duration-500 sm:px-6 lg:px-8",
          isScrolled
            ? "bg-white/95 backdrop-blur [@supports(backdrop-filter:blur(0))]:bg-white/75"
            : "bg-transparent",
        )}
      >
        <div className="flex items-center justify-center w-full">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {data.name}
          </h1>
        </div>
      </header>
      <main className="container mx-auto md:py-16 ">
        <ol className="sm:px-4">
          {data.endpoints.map((endpoint) => (
            <Row
              key={endpoint.url}
              endpoint={endpoint}
            />
          ))}
        </ol>
      </main>
      <footer className="border-t bottom-0 inset-x-0 py-16">
        <p className="text-center text-slate-400">
          Powered by{" "}
          <Link
            className="text-primary-400 font-medium hover:text-slate-600"
            href="https://planetfall.io"
          >
            planetfall.io
          </Link>
        </p>
      </footer>
    </div>
  );
}

export function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps(ctx: GetStaticPropsContext) {
  const slug = ctx.params?.slug;
  if (!slug || Array.isArray(slug)) {
    return {
      props: {},
      revalidate: 60,
    };
  }

  const db = new PrismaClient();

  const page = await db.statusPage.findUnique({
    where: {
      slug,
    },
    include: {
      endpoints: {
        where: {
          active: true,
        },
        include: {
          checks: {
            orderBy: {
              time: "asc",
            },
            where: {
              time: {
                "gte": new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      },
    },
  });

  if (!page) {
    return {
      props: {},
      revalidate: 60,
    };
  }

  const regions = await db.region.findMany();
  const regionIdToName = regions.reduce((acc, region) => {
    acc[region.id] = region.name;
    return acc;
  }, {} as Record<string, string>);

  const data: PageProps = {
    name: page.name,
    endpoints: page.endpoints.map((e) => ({
      name: e.name,
      url: e.url,
      degradedAfter: e.degradedAfter ?? undefined,
      checks: e.checks.map((c) => ({
        time: c.time.getTime(),
        latency: c.latency,
        region: regionIdToName[c.regionId],
      })),
      regions: (e.regions as string[]).map((regionId) =>
        regionIdToName[regionId]
      ),
    })),
  };

  return {
    props: {
      data,
    },
    revalidate: 60,
  };
}
