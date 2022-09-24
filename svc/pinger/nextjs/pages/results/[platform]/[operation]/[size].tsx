import type { GetStaticPropsContext, NextPage } from "next";

import { getResults } from "@lib/results";
import type { Series } from "@lib/types";
import { Layout } from "@components/layout";
import { Region, Regions } from "@components/regions";
import { Redis } from "@upstash/redis";
import { Popover, Transition } from "@headlessui/react";
import clsx from "clsx";
import {
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/20/solid";
import { Fragment } from "react";
import {
  CloudflareLogo,
  FlyLogo,
  UpstashLogo,
  VercelLogo,
} from "@components/logos";
import Link from "next/link";
import { percentile } from "@lib/percentile";
import { useRouter } from "next/router";
export type Props = {
  regions: Region[];
  platform: string;
  operation: "read" | "write";
  size: string;
};

const platforms = ["vercel-serverless", "vercel-edge", "cloudflare", "fly.io"];
const operations = ["read", "write"];
const sizes = ["1kb", "10kb", "50kb"];
const Home: NextPage<Props> = ({ regions, platform, operation, size }) => {
  const router = useRouter();
  const selectedRegion = router.query.regions;
  if (selectedRegion) {
    const selectedRegions = Array.isArray(selectedRegion) ? selectedRegion : selectedRegion.split(",")
    regions = regions.filter((r) => selectedRegions.includes(r.id));
  }
  return (
    <Layout
      content={
        <Popover.Group as="nav" className="hidden space-x-10 md:flex">
          <Popover className="relative">
            {({ open }) => (
              <>
                <Popover.Button
                  className={clsx(
                    open ? "text-slate-900" : "text-slate-500",
                    "group inline-flex items-center rounded  text-base font-medium hover:text-slate-900 focus:outline-none",
                  )}
                >
                  <span>Settings</span>
                  <ChevronDownIcon
                    className={clsx(
                      open ? "text-slate-600" : "text-slate-400",
                      "ml-2 h-5 w-5 group-hover:text-slate-500",
                    )}
                    aria-hidden="true"
                  />
                </Popover.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <Popover.Panel className="absolute bg-white left-1/2 z-10 mt-3 w-screen max-w-md -translate-x-1/2 transform px-2 sm:px-0">
                    <div className="overflow-hidden rounded shadow-lg">
                      <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-">
                        <h3>Select the entry size</h3>
                        <p className="text-slate-500">
                          Larger entries usually have slightly higher latencies.
                        </p>
                      </div>
                      <div className="space-y-6 px-5 pt-5 pb-9 sm:flex sm:space-y-0 sm:space-x-10 sm:px-8">
                        {sizes.map((s) => (
                          <div key={s} className="flow-root">
                            <a
                              href={`/results/${platform}/${operation}/${s}`}
                              className={clsx(
                                "uppercase flex items-center rounded text-base font-medium p-3 -m-3 text-slate-900 transition duration-150 ease-in-out hover:bg-slate-100",
                                s === size ? "bg-slate-50" : "",
                              )}
                            >
                              {s}
                            </a>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-slate-200 relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8 ">
                        <h3>Display read or write operations</h3>
                        <p className="text-slate-500">
                          For global databases, all writes go to a single
                          leader, read operations can be handled by all
                          replicas.
                        </p>
                      </div>
                      <div className="space-y-6 px-5 pt-5 pb-9 sm:flex sm:space-y-0 sm:space-x-10 sm:px-8">
                        {operations.map((op) => (
                          <div key={op} className="flow-root">
                            <a
                              href={`/results/${platform}/${op}/${size}`}
                              className={clsx(
                                "uppercase flex items-center rounded text-base font-medium p-3 -m-3 text-slate-900 transition duration-150 ease-in-out hover:bg-slate-100",
                                operation === op ? "bg-slate-50" : "",
                              )}
                            >
                              {op}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
        </Popover.Group>
      }
    >
      <div>
      </div>
      <header className="py-8 lg:py-16 text-center  bg-gradient-to-tl from-black via-slate-800 to-black text-slate-100">
        <div className=" flex items-center gap-4 lg:gap-12">
          <div className="w-2/5 flex justify-end">
            <div className="w-20 h-20 flex flex-col items-center justify-center text-white fill-current">
              {platform.startsWith("vercel")
                ? <VercelLogo />
                : platform === "fly.io"
                  ? <FlyLogo />
                  : <CloudflareLogo />}
              {platform === "vercel-edge"
                ? (
                  <span className="text-slate-300   whitespace-nowrap ">
                    Edge Function
                  </span>
                )
                : null}
              {platform === "vercel-serverless"
                ? (
                  <span className="text-slate-300   whitespace-nowrap ">
                    Serverless Function
                  </span>
                )
                : null}
            </div>
          </div>
          <div className="w-1/5 flex justify-center flex-col items-center">
            {operation === "read"
              ? <ArrowLongLeftIcon className="h-6 w-6 lg:h-10 lg:w-10" />
              : <ArrowLongRightIcon className="h-6 w-7 lg:h-10 lg:w-19" />}
            <div className="text-slate-300 font-normal">
              {operation === "read" ? "reading" : "writing"}
              <span className="font-medium text-white">
                {" "}
                {size.toLocaleUpperCase()}
              </span>
            </div>
          </div>
          <div className="w-2/5 flex justify-start">
            <div className="w-20 h-20 flex items-center justify-center">
              <UpstashLogo />
            </div>
          </div>
        </div>
      </header>

      <main className="mt-10">
        <Regions regions={regions} />
      </main>
      <footer className="mt-8 border-t border-gray-300 pt-8">
        <p className="text-center text-gray-500 text-sm">
          Every bar in the charts represents a single measurement.
          Percentiles are aggregated over the last 24h, while the chart
          only shows roughly the last hour.
        </p>
        <div className="mt-8 md:flex md:items-center md:justify-between container mx-auto">
          <div className="flex space-x-6 md:order-2">
            <Link
              href="https://github.com/upstash/latency"
              target="_blank"
              aria-label="GitHub"
            >
              <svg
                className="w-6 h-6 fill-current text-gray-400 hover:text-gray-300 hover:cursor-pointer duration-150"
                aria-hidden="true"
                viewBox="0 0 16 16"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" />
              </svg>
            </Link>
          </div>
          <p className="mt-8 text-base text-gray-400 md:order-1 md:mt-0">
            &copy; {new Date().getFullYear()} Upstash, Inc. Based in California.
          </p>
        </div>
      </footer>
    </Layout>
  );
};

export default Home;

export function getStaticPaths() {
  const paths: {
    params: { platform: string; operation: string; size: string };
  }[] = [];
  for (const platform of platforms) {
    /**
     * Quick hack to also track ping latencies on fly.io
     */
    if (platform === "fly.io") {
      for (const size of sizes) {
        paths.push({ params: { platform, operation: "ping", size } });
      }
    }

    for (const operation of operations) {
      for (const size of sizes) {
        paths.push({ params: { platform, operation, size } });
      }
    }
  }

  return {
    paths,
    fallback: false,
  };
}
export async function getStaticProps(ctx: GetStaticPropsContext) {
  const platform = ctx.params?.platform as string | undefined;
  if (!platform) {
    throw new Error("No platform specified");
  }
  const operation = ctx.params?.operation as "read" | "write" | undefined;
  if (!operation) {
    throw new Error("No operation specified");
  }
  const size = ctx.params?.size as string | undefined;
  if (!size) {
    throw new Error("No size specified");
  }

  const redis = Redis.fromEnv();
  const regionKeys = await redis.keys(
    `results:${platform}:${operation}:${size}:*`,
  );
  const regionIds = regionKeys.map((key) => key.split(":")[4]);

  const regions = await Promise.all(
    regionIds.map(async (region) => {
      let records = await getResults({
        platform,
        region: region,
        type: operation,
        size,
      }, { since: Date.now() - 1000 * 60 * 60 * 24 });
      records.sort((a, b) => b.ts - a.ts);

      const series: Series = {
        data: [],
        min: Number.MAX_SAFE_INTEGER,
        max: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      };

      const latenciesInLast24h = records.map(({ latency }) => latency).sort();
      series.p50 = percentile(0.5, latenciesInLast24h);
      series.p95 = percentile(0.95, latenciesInLast24h);
      series.p99 = percentile(0.99, latenciesInLast24h);

      const displayBars = 60;
      for (const { latency, ts } of records) {
        if (latency < series.min) {
          series.min = latency;
        }
        if (latency > series.max) {
          series.max = latency;
        }
        if (series.data.length < displayBars) {
          series.data.unshift({ ts, latency });
        }
      }

      while (series.data.length < displayBars) {
        series.data.unshift({ ts: 0, latency: -1 });
      }
      if (series.data.length > displayBars) {
        series.data = series.data.slice(
          series.data.length - displayBars,
        );
      }

      return {
        id: region,
        series: series,
      };
    }),
  );

  return {
    props: {
      platform,
      operation,
      regions: regions.filter(({ series }) => series.data.length > 0).sort((a, b) => a.series.p99 - b.series.p99),
      size,
    },
    revalidate: 60,
  };
}
