import { db, Region } from "@planetfall/db";
import React, { cache } from "react";
import Link from "next/link";
import { getEndpointMetricsOver90Days, getEndpointSeriesOver90Days } from "@planetfall/tinybird";
import { EndpointData, Metrics } from "./types";
import { Endpoint } from "./endpoint";
import { notFound } from "next/navigation";

export const revalidate = 60;
export const dynamic = "error";

const getStatusPage = cache(
  async (slug: string) =>
    await db.statusPage.findUnique({
      where: { slug },
      include: {
        endpoints: {
          include: {
            regions: true,
          },
        },
      },
    }),
);

export default async function Page(props: { params: { slug: string } }) {
  console.log("Requested page", props.params.slug);
  const statusPage = await getStatusPage(props.params.slug);
  if (!statusPage) {
    return notFound();
  }

  /**
   * Create a map of regionIds to regionNames for easy lookup
   */
  const regions = new Map<string, Region>();
  for (const e of statusPage.endpoints) {
    for (const r of e.regions) {
      regions.set(r.id, r);
    }
  }

  const endpointIds = statusPage.endpoints.map((e) => e.id);

  const [metrics, series] = await Promise.all([
    getEndpointMetricsOver90Days({ endpointIds }),
    getEndpointSeriesOver90Days({ endpointIds }),
  ]);

  const data: {
    [endpointId: string]: EndpointData;
  } = {};
  for (const e of statusPage.endpoints) {
    data[e.id] = {
      id: e.id,
      name: e.name,
      regions: {},
    };
  }

  for (const m of metrics.data) {
    const region = regions.get(m.regionId);
    if (!region) {
      console.error(`Region ${m.regionId} not found for endpoint ${m.endpointId}!`);
    }
    data[m.endpointId].regions[m.regionId] = {
      id: m.regionId,
      // @ts-ignore
      platform: region?.platform ?? "",
      name: region?.name ?? m.regionId,
      p75: m.p75,
      p90: m.p90,
      p95: m.p95,
      p99: m.p99,
      count: m.count,
      errors: m.errors,
      series: [],
    };
  }
  for (const s of series.data) {
    data[s.endpointId].regions[s.regionId].series.push({
      time: s.time,
      p75: s.p75,
      p90: s.p90,
      p95: s.p95,
      p99: s.p99,
      count: s.count,
      errors: s.errors,
    });
  }

  for (const [endpointId, regions] of Object.entries(data)) {
    for (const [regionId, region] of Object.entries(regions.regions)) {
      const time = new Date();
      time.setUTCHours(0, 0, 0, 0);

      const days: (Metrics & { time: number })[] = [];
      for (let i = 0; i < 90; i++) {
        days.unshift(
          region.series.find((s) => new Date(s.time).toDateString() === time.toDateString()) ?? {
            time: time.getTime(),
            count: -1,
            p75: -1,
            p90: -1,
            p95: -1,
            p99: -1,
            errors: -1,
          },
        );
        time.setDate(time.getDate() - 1);
      }
      data[endpointId].regions[regionId].series = days;
    }
  }

  /**
   * A map for quick lookup whether a region should be included in the chart, depending on its
   * current configuration.
   *
   * If we would not do this, then we would also show regions that have since been removed, but
   * are still being returned by tinybird
   */
  const shouldInclude: {
    [endpointId: string]: {
      [regionId: string]: boolean;
    };
  } = {};
  for (const e of statusPage.endpoints) {
    shouldInclude[e.id] = {};
    for (const r of e.regions) {
      shouldInclude[e.id][r.id] = true;
    }
  }
  for (const [endpointId, regions] of Object.entries(data)) {
    for (const regionId of Object.keys(regions.regions)) {
      if (regionId !== "global" && !shouldInclude[endpointId][regionId]) {
        data[endpointId].regions[regionId] = undefined;
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen px-4 overflow-hidden md:px-0 ">
      <header className="container flex items-center justify-between w-full mx-auto mt-4 lg:mt-8 xl:mt-16 ">
        <h2 className="mb-4 text-5xl font-bold text-zinc-900">{statusPage.name}</h2>
      </header>
      <main className="container min-h-screen py-8 mx-auto ">
        <ul className="flex flex-col gap-4 lg:gap-8">
          {Object.values(data)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((endpoint) => (
              <li key={endpoint.id}>
                <Endpoint endpoint={endpoint} />
              </li>
            ))}
        </ul>
      </main>
      <footer className="inset-x-0 bottom-0 py-16 border-t">
        <p className="text-center text-zinc-400">
          Powered by{" "}
          <Link
            className="font-medium duration-150 text-zinc-500 hover:text-zinc-600"
            href="https://planetfall.io"
          >
            planetfall.io
          </Link>
        </p>
      </footer>
    </div>
  );
}
