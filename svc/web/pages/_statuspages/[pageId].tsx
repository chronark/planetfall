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
import React, { useMemo } from "react";
import JSXStyle from "styled-jsx/style";
import superjson from "superjson";
import { SuperJSONResult } from "superjson/dist/types";
import { usePercentile } from "../../lib/hooks/percentile";
import { Area, Heatmap, Line, TinyArea } from "@ant-design/plots";


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
  { endpoint: EndpointType & { checks: Check[] } }
> = (
  { endpoint },
): JSX.Element => {
    const values = useMemo(() => endpoint.checks.map((c) => c.latency), [
      endpoint.checks,
    ]);
    const min = useMemo(() => Math.min(...values), values);
    const max = useMemo(() => Math.max(...values), values);
    const p50 = usePercentile(0.5, values);
    const p95 = usePercentile(0.95, values);
    const p99 = usePercentile(0.99, values);

    return (
      <li className="border-t sm:border border-slate-300 sm:border-slate-100 sm:shadow-ambient md:rounded my-16  hover:border-primary-500 duration-1000">
        <div className="flex-col gap-2 lg:flex-row items-start border-b border-slate-200  px-4 py-5 sm:px-6 flex justify-between md:items-center">
          <div className="lg:w-1/2">
            <span className="text-lg font-medium leading-6 text-slate-900">{endpoint.name ?? endpoint.url}</span>
          </div>
          <div className="lg:w-1/2 flex gap-2 sm:gap-4 xl:gap-6 justify-between flex-wrap md:flex-nowrap">
            <Stat label="min" value={Math.round(min)} />
            <Stat label="max" value={Math.round(max)} />
            <Stat label="p50" value={Math.round(p50)} />
            <Stat label="p95" value={Math.round(p95)} />
            <Stat label="p99" value={Math.round(p99)} />
          </div>
        </div>

        <div className="px-4 pt-10 pb-5 sm:px-6" >

          <Line
            style={{ height: "100px" }}
            data={endpoint.checks.map(c => ({ ...c, time: c.time.toLocaleString() }))}
            xField="time"
            yField="latency"
            seriesField="regionId"
            autoFit={true}
            smooth={true}
            legend={{
              position: "bottom",
            }}
            yAxis={{
              // title: { text: "Latency [ms]" },
              tickCount: 0


            }}
            xAxis={{
              tickCount: 5,
              label: {
                formatter: (text) => new Date(text).toLocaleTimeString(),
              },
            }}
            tooltip={{
              title: (d) => new Date(d).toLocaleString(),
            }}
          />
        </div>


      </li>
    );
  };
export default function Page(
  { data }: { data: SuperJSONResult },
) {
  const page = superjson.deserialize<
    StatusPage & { endpoints: (EndpointType & { checks: Check[] })[] }
  >(data);


  return (
    <div>
      <header className="border-b py-4">
        <div className="flex items-center justify-center ">
          <h1 className="text-4xl font-bold pt-4 tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            {page.name}
          </h1>
        </div>
      </header>
      <main className="container mx-auto md:py-16 lg:py-24 xl:py-32">
        <ol className="sm:px-4">

          {page.endpoints.map((endpoint) => (

            <Row key={endpoint.id} endpoint={endpoint} />


          ))}
        </ol>


      </main>
      <footer>
        <div className="border-t pt-16">
          <p className="mx-auto container mb-16 text-base text-center text-slate-400">
            &copy; {new Date().getUTCFullYear()}{" "}
            planetfall.io - All rights reserved.
          </p>
        </div>
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
  const pageId = ctx.params?.pageId;
  console.log("Getting static props for page", pageId);
  if (!pageId || Array.isArray(pageId)) {
    throw new Error("pageId should be string");
  }

  const db = new PrismaClient();

  const page = await db.statusPage.findUnique({
    where: {
      id: pageId,
    },
    include: {
      endpoints: {
        include: {
          checks: {
            orderBy: {
              time: "desc",
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
    throw new Error("page not found");
  }

  const regions = await db.region.findMany()
  const regionIdToName = regions.reduce((acc, region) => {
    acc[region.id] = region.name
    return acc
  }, {} as Record<string, string>)
  for (const endpoint of page.endpoints) {
    endpoint.checks = endpoint.checks.map(c => ({ ...c, regionId: regionIdToName[c.regionId] }))
  }

  return {
    props: {
      data: superjson.serialize(page),
    },
    revalidate: 60,
  };
}
