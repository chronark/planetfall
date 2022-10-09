import { ChevronDownIcon } from "@heroicons/react/24/solid";
import {
  Check,
  Endpoint as EndpointType,
  PrismaClient,
  Region as RegionType,
  StatusPage,
} from "@planetfall/db";
import { Collapse, Popover } from "antd";
import classNames from "classnames";
import { GetStaticPropsContext } from "next";
import React, { useEffect, useMemo, useState } from "react";
import { usePercentile } from "../../lib/hooks/percentile";
import { Area, Heatmap, Line, TinyArea } from "@ant-design/plots";
import Link from "next/link";
import { NotFound } from "../../components/notFound/notFound";

export type PageProps = {
  name: string;
  endpoints: {
    name: string | null;
    url: string;
    checks: { time: number; latency: number | null; region: string }[];
  }[];
};

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  return (
    <div className="flex items-center text-sm text-slate-500 space-x-1 whitespace-nowrap">
      <span className="flex-shrink-0 font-semibold">
        {label}:
      </span>
      <span>{value} ms</span>
    </div>
  );
};

const Row: React.FC<
  {
    endpoint: PageProps["endpoints"][0];
    charts: number;
  }
> = (
  { endpoint, charts },
): JSX.Element => {
  const values = useMemo(
    () =>
      endpoint.checks.filter((c) => typeof c.latency === "number").map((c) =>
        c.latency
      ) as number[],
    [
      endpoint.checks,
    ],
  );

  const min = useMemo(() => Math.min(...values), [values]);
  const max = useMemo(() => Math.max(...values), [values]);
  const p50 = usePercentile(0.5, values);
  const p95 = usePercentile(0.95, values);
  const p99 = usePercentile(0.99, values);

  return (
    // <div className="flex space-x-0.5 h-8 items-end mt-16">
    //   {data.map((point, i) => {

    //     const cn = ["flex-1 w h-full rounded-sm hover:opacity-80 hover:scale-y-125 transition-all duration-500"]

    //     if (point.buffer) {
    //       cn.push("bg-slate-50 border border-slate-300 hover:bg-slate-100 animate-pulse")
    //     } else if (point.error) {
    //       cn.push("bg-rose-400 border border-rose-600 hover:bg-rose-100")
    //     } else if (endpoint.data?.degradedAfter && point.latency && point.latency >= endpoint.data.degradedAfter) {
    //       cn.push("bg-amber-400 border border-amber-600 hover:bg-amber-100")
    //     } else {
    //       cn.push("bg-emerald-300 border border-emerald-500 hover:bg-emerald-100")

    //     }
    //     return (
    //       <HoverCard.Root openDelay={50} closeDelay={40} key={i}>
    //         <HoverCard.Trigger
    //           key={i}
    //           className={cn.join(" ")}
    //         // style={{
    //         //   height: `${height}%`,
    //         // }}
    //         />{" "}
    //         <HoverCard.Portal>
    //           <HoverCard.Content>
    //             {!point.buffer
    //               ? (
    //                 <>
    //                   <div className="overflow-hidden rounded-sm bg-white px-4 py-5 shadow sm:p-6">
    //                     <dt className="truncate text-sm font-medium text-slate-500">
    //                       {point.time.toLocaleString()}
    //                     </dt>
    //                     <dt className="truncate text-sm font-medium text-slate-500">
    //                       {point.region}
    //                     </dt>
    //                     <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
    //                       {point.latency?.toLocaleString()} ms
    //                     </dd>
    //                   </div>
    //                   <HoverCard.Arrow />
    //                 </>
    //               )
    //               : null}
    //           </HoverCard.Content>
    //         </HoverCard.Portal>
    //       </HoverCard.Root>
    //     );
    //   })}
    // </div>

    // <div className="relative">
    //   <div className="absolute inset-0 flex items-center" aria-hidden="true">
    //     <div className={classNames("w-full border-t",
    //       {
    //         "border-emerald-500": availability >= 0.99,
    //         "border-orange-500": availability < 0.99 && availability >= 0.95,
    //         "border-rose-500": availability < 0.95
    //       })} />
    //   </div>
    //   <div className="relative flex justify-center">
    //     <span className={classNames("bg-white px-2 text-sm",
    //       {
    //         "text-emerald-500": availability >= 0.99,
    //         "text-orange-500": availability < 0.99 && availability >= 0.95,
    //         "text-rose-500": availability < 0.95
    //       }
    //     )}>{(availability * 100).toFixed(2)}%</span>
    //   </div>
    // </div>
    <li className="border-t sm:border border-slate-300 sm:border-slate-100 sm:shadow-ambient md:rounded my-16  hover:border-primary-500 duration-1000">
      <div className="flex-col gap-2 lg:flex-row items-start border-b border-slate-200  px-4 py-5 sm:px-6 flex justify-between md:items-center">
        <div className="lg:w-1/2">
          <span className="text-lg font-medium leading-6 text-slate-900">
            {endpoint.name ?? endpoint.url}
          </span>
        </div>
        <div className="lg:w-1/2 flex gap-2 sm:gap-4 xl:gap-6 justify-between flex-wrap md:flex-nowrap">
          <Stat label="min" value={Math.round(min)} />
          <Stat label="max" value={Math.round(max)} />
          <Stat label="p50" value={Math.round(p50)} />
          <Stat label="p95" value={Math.round(p95)} />
          <Stat label="p99" value={Math.round(p99)} />
        </div>
      </div>

      <div className="px-4 pt-10 pb-5 sm:px-6">
        <Line
          style={{ height: charts > 3 ? "100px" : "150px" }}
          data={endpoint.checks.map((c) => ({
            ...c,
            time: new Date(c.time).toLocaleString(),
          }))}
          xField="time"
          yField="latency"
          seriesField="region"
          autoFit={true}
          smooth={true}
          legend={{
            position: "bottom",
          }}
          yAxis={false}
          xAxis={{
            tickCount: 5,
            label: {
              formatter: (text) => new Date(text).toLocaleTimeString(),
            },
          }}
          tooltip={{
            title: (d) => new Date(d).toLocaleString(),
          }}
          lineStyle={{
            lineWidth: 1.5,
          }}
        />
      </div>
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
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
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
              charts={data.endpoints.length ?? 0}
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
                "gte": new Date(Date.now() - 60 * 60 * 1000),
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
      checks: e.checks.map((c) => ({
        time: c.time.getTime(),
        latency: c.latency,
        region: regionIdToName[c.regionId],
      })),
    })),
  };

  return {
    props: {
      data,
    },
    revalidate: 60,
  };
}
