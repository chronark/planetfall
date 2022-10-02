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

export const Chart: React.FC<{ checks: Check[] }> = (
  { checks },
): JSX.Element => {
  // localMax is the maximum of all displayed data points
  const localMax = Math.max(...checks.map((x) => x.latency));
  return (
    <div className="flex space-x-px h-10 items-end">
      {checks.map(({ time, latency, regionId }, i) => {
        const height = latency >= 0
          ? Math.max(10, Math.min(100, (latency / localMax) * 100))
          : 100;
        const cn = classNames(
          "flex-1 h-full rounded-sm hover:opacity-80 hover:scale-y-125 transition-all duration-300",
          {
            "bg-slate-200": latency < 0,
            "bg-rose-400": latency > 300,
            " bg-amber-300": latency <= 300 && latency > 100,
            " bg-emerald-400": latency >= 0 && latency <= 100,
          },
        );
        return (
          <Popover
            key={i}
            content={time.getTime() > 0
              ? (
                <>
                  <div className="overflow-hidden rounded-sm bg-white px-4 py-5 shadow sm:p-6">
                    <dt className="truncate text-sm font-medium text-slate-500">
                      {time.toLocaleString()}
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                      {latency} ms
                    </dd>
                    <dd className="mt-1 text-sm font-medium text-slate-500">
                      from <span className="font-semibold">{regionId}</span>
                    </dd>
                  </div>
                </>
              )
              : null}
          >
            <div
              key={i}
              className={cn}
              style={{
                height: `${height}%`,
              }}
            >
            </div>
          </Popover>
        );
      })}
    </div>
  );
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

const Endpoint: React.FC<
  { endpoint: EndpointType & { checks: Check[] }; regions: RegionType[] }
> = ({ endpoint, regions }): JSX.Element => {
  const values = endpoint.checks.slice(60).map((c) => c.latency);
  const min = useMemo(() => Math.min(...values), values);
  const max = useMemo(() => Math.max(...values), values);
  const p50 = usePercentile(0.5, values);
  const p95 = usePercentile(0.95, values);
  const p99 = usePercentile(0.99, values);

  return (
    <div>
      <div className="flex items-center py-5 px-4 sm:py-8 sm:px-0">
        <div className="min-w-0 items-center w-full space-y-4">
          <div className="flex items-start md:items-center flex-col md:flex-row justify-between w-full space-y-2 md:space-y-0 md:space-x-4">
            <span className="flex flex-1 items-center space-x-4 font-medium px-4  text-xl text-slate-900 sm:truncate sm:text-2xl">
              {endpoint.name ?? endpoint.url}
            </span>
            <div className="flex flex-1 gap-2 sm:gap-4 xl:gap-6 justify-between flex-wrap md:flex-nowrap">
              <Stat label="min" value={Math.round(min)} />
              <Stat label="max" value={Math.round(max)} />
              <Stat label="p50" value={Math.round(p50)} />
              <Stat label="p95" value={Math.round(p95)} />
              <Stat label="p99" value={Math.round(p99)} />
            </div>
          </div>

          <Chart
            checks={endpoint.checks.slice(0, 60).map((c) => ({
              ...c,
              regionId: regions.find((r) => r.id === c.regionId)?.name ?? "",
            }))}
          />
        </div>
      </div>
    </div>
  );
};

const Region: React.FC<
  { regionId: string; checks: Check[]; regionName: string }
> = ({ regionId, regionName, checks }): JSX.Element => {
  const values = useMemo(() => checks.slice(0, 60).map((c) => c.latency), [
    checks,
  ]);
  const min = useMemo(() => Math.min(...values), values);
  const max = useMemo(() => Math.max(...values), values);
  const p50 = usePercentile(0.5, values);
  const p95 = usePercentile(0.95, values);
  const p99 = usePercentile(0.99, values);

  return (
    <div>
      <div className="flex items-center py-5 px-4 sm:py-8 sm:px-0">
        <div className="min-w-0 items-center w-full space-y-4">
          <div className="flex items-start md:items-center flex-col md:flex-row justify-between w-full space-y-2 md:space-y-0 md:space-x-4">
            <h3 className="flex flex-1 items-center space-x-4">
              <span
                className={classNames(
                  "font-medium px-4 py-1 text-xl text-slate-900 sm:truncate",
                  {
                    "border-slate-200": p95 <= 0,
                    "border-rose-400": p95 > 300,
                    " border-amber-300": p95 <= 300 && p95 > 100,
                    " border-emerald-400": p95 >= 0 && p95 <= 100,
                  },
                )}
              >
                {regionName}
              </span>
            </h3>{" "}
            <div className="flex flex-1 gap-2 sm:gap-4 xl:gap-6 justify-between flex-wrap md:flex-nowrap">
              <Stat label="min" value={Math.round(min)} />
              <Stat label="max" value={Math.round(max)} />
              <Stat label="p50" value={Math.round(p50)} />
              <Stat label="p95" value={Math.round(p95)} />
              <Stat label="p99" value={Math.round(p99)} />
            </div>
          </div>
          <TinyArea
            height={60}
            smooth={true}
            autoFit={false}
            data={checks.map((c) => c.latency)}
          />
        </div>
      </div>
    </div>
  );
};

const Row: React.FC<
  { endpoint: EndpointType & { checks: Check[] }; regions: RegionType[] }
> = (
  { endpoint, regions },
): JSX.Element => {
  const checksByRegion = endpoint.checks.reduce((acc, c) => {
    if (!(c.regionId in acc)) {
      acc[c.regionId] = [];
    }
    acc[c.regionId].push(c);
    return acc;
  }, {} as Record<string, Check[]>);

  return (
    <div>
      {Object.entries(checksByRegion).map(([regionId, checks]) => (
        <Region
          key={regionId}
          regionId={regionId}
          regionName={regions.find((r) => r.id === regionId)?.name ?? ""}
          checks={checks}
        />
      ))}
    </div>
  );
};
export default function Page(
  { data, regions }: { data: SuperJSONResult; regions: RegionType[] },
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
      <main className="container mx-auto py-32">
        <Collapse
          ghost
          expandIconPosition="end"
          expandIcon={(p) => (
            <ChevronDownIcon
              className={`w-8 h-8 transform-all duration-150 ${
                p.isActive ? "rotate-90" : ""
              }`}
            />
          )}
        >
          {page.endpoints.map((endpoint) => (
            <Collapse.Panel
              key={endpoint.id}
              header={<Endpoint endpoint={endpoint} regions={regions} />}
            >
              <Row endpoint={endpoint} regions={regions} />
            </Collapse.Panel>
          ))}
        </Collapse>
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

  return {
    props: {
      data: superjson.serialize(page),
      regions: await db.region.findMany(),
    },
    revalidate: 60,
  };
}
