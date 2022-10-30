import classNames from "classnames";
import React from "react";import { db } from "@planetfall/db";

export type PageProps = {
  name: string;
  team: { retention: number };
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
    <div className="flex items-center text-sm text-slate-400 space-x-1 whitespace-nowrap">
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
  endpoint: {
    endpointId: string,
    name: string | null,
    url: string,
    metrics: EndpointMetric[],
  };
  withAvailability?: boolean;
  nBuckets: number;
}> = (
  { endpoint, height, withAvailability, nBuckets },
): JSX.Element => {

    console.log(endpoint)
    const max = Math.max(...endpoint.metrics.map(m => m.max))


    const errors = 0

    // const errors = endpoint.checks.filter((s) => s.error).length;
    const availability = endpoint.metrics.length > 0
      ? 1 - (errors / endpoint.metrics.length)
      : 1;
    return (
      <div>
        {withAvailability
          ? (
            <div className="relative mb-2">
              <div
                className="absolute inset-0 flex items-center "
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
                  className={classNames("border rounded border-emerald-400 bg-slate-800 px-2 text-sm", {
                    "text-emerald-400": availability >= 0.99,
                    "text-orange-300": availability < 0.99 &&
                      availability >= 0.95,
                    "text-rose-300": availability < 0.95,
                  })}
                >
                  {(availability * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          )
          : null}
        <div className={`flex space-x-1 ${height ?? "h-12"} items-end`}>
          {endpoint.metrics.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
            .map((bucket, i) => {
              const start = new Date(bucket.time);
              const end = new Date(start.getTime() + 60 * 60 * 1000);

              const height = Math.min(1, Math.log(bucket.p99) / Math.log(max)) * 100;

              // const bucketErrors = bucket.filter((c) => c.error);
              // const bucketDegraded = endpoint.degradedAfter
              //   ? p99 > endpoint.degradedAfter
              //   : 0;
              const cn = [
                "flex-1 h-full rounded-sm  transition-all duration-150",
              ];


              cn.push(
                "bg-emerald-500  border border-emerald-300 hover:bg-emerald-100",
              );

              return (

                <div
                  key={i}
                  className={cn.join(" ")}
                  style={{
                    height: `${height}%`,
                  }}
                >{" "}
                </div>

              );
            })}
        </div>
      </div>
    );
  };

const Row: React.FC<
  {
    endpoint: {

      endpointId: string,
      name: string | null,
      url: string,
      metrics: EndpointMetric[],
    }
    maxBuckets: number;
  }
> = (
  { endpoint, maxBuckets },
): JSX.Element => {


    return (
      <div className=" border-t list-none sm:border border-slate-800 sm:border-slate-800 sm:shadow-ambient md:rounded my-16  hover:border-slate-700 duration-1000">
        <div className="flex-col gap-2 lg:flex-row items-start border-b border-slate-800  px-4 py-5 sm:px-6 flex justify-between md:items-center">
          <div className="lg:w-1/2">
            <span className="text-lg font-medium leading-6 text-slate-100">
              {endpoint.name ?? endpoint.url}
            </span>
          </div>
          <div className="lg:w-1/2 flex gap-2 sm:gap-4 xl:gap-6 justify-between flex-wrap md:flex-nowrap items-center">
            {/* <Stat label="min" value={Math.round(min)} />
            <Stat label="max" value={Math.round(max)} />
            <Stat label="p50" value={Math.round(p50)} />
            <Stat label="p95" value={Math.round(p95)} />
            <Stat label="p99" value={Math.round(p99)} /> */}
          </div>
        </div>

        <div className="p-4 flex flex-col space-y-8">
          <div className="hidden lg:block">
            <Chart
              endpoint={endpoint}
              withAvailability
              nBuckets={Math.min(72, maxBuckets)}
            />
          </div>
          <div className="lg:hidden">
            <Chart
              endpoint={endpoint}
              withAvailability
              nBuckets={Math.min(24, maxBuckets)}
            />
          </div>

          {/* <button className="relative" onClick={() => setExpanded(!expanded)}>
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className=" bg-white px-2 text-slate-500 hover:text-primary-500 ">
                {expanded
                  ? <MinusIcon className="h-6 w-6" />
                  : <PlusIcon className="h-6 w-6" />}
              </span>
            </div>
          </button>

          <AnimatePresence>
            {expanded
              ? (
                <ul
                  className="space-y-4 lg:space-y-8"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: {
                      transition: {
                        staggerChildren: 0.1,
                      },
                    },
                  }}
                >
                  {endpoint.regions.map((region) => {
                    const scopedChecks = endpoint.checks.filter((c) =>
                      c.region === region
                    );

                    return (
                      <li
                        key={region}
                        variants={{
                          hidden: { scale: 0.8, opacity: 0 },
                          show: { scale: 1, opacity: 1 },
                        }}
                      >
                        <Heading h4>{region}</Heading>

                        <div className="hidden lg:block">
                          <Chart
                            endpoint={{ ...endpoint, checks: scopedChecks }}
                            nBuckets={Math.min(72, maxBuckets)}
                          />
                        </div>
                        <div className="lg:hidden">
                          <Chart
                            endpoint={{ ...endpoint, checks: scopedChecks }}
                            nBuckets={Math.min(24, maxBuckets)}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )
              : null}
          </AnimatePresence> */}
        </div>
      </div>
    );
  };



async function getEndpointData(endpointId: string) {
  const res = await fetch(`https://api.tinybird.co/v0/pipes/production__endpoint_buckets__v1.json?endpointId=${endpointId}`, {
    headers: {
      Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`
    }
  })

  const data = await res.json() as {
    data: EndpointMetric[]
  }

  console.log(data)
  return data.data


}



type EndpointMetric = {
  time: string,
  min: number,
  max: number,
  p50: number,
  p95: number,
  p99: number
}

const slug = "dub"




export default async function Page() {
  const statusPage = await db.statusPage.findUnique({ where: { slug }, include: { endpoints: true, team: true } })
  if (!statusPage) {
    return null
  }





  const endpoints = await Promise.all(statusPage.endpoints.map(async (e) => ({
    endpointId: e.id,
    name: e.name,
    url: e.url,
    metrics: await getEndpointData(e.id)
  })))



  // Due to different retentions, we need to adjust the number of buckets
  const maxBuckets = Math.ceil(statusPage.team.retention / 1000 / 60 / 60);
  // console.log({endpoints, statusPage})
  return (
    <div
      className="mt-20 -pt-20 container mx-auto"
    >
      <div className="text-white">






        <ul>
          {endpoints.map((e) => (

            <li key={e.endpointId}>
              <div className=" border-t list-none sm:border border-slate-300 sm:border-slate-100 sm:shadow-ambient md:rounded my-16  hover:border-slate-800 duration-1000">
                <div className="flex-col gap-2 lg:flex-row items-start border-b border-slate-200  px-4 py-5 sm:px-6 flex justify-between md:items-center">
                  <div className="lg:w-1/2">
                    <span className="text-lg font-medium leading-6 text-slate-900">
                      {e.name ?? e.url}
                    </span>
                  </div>
                  <div className="lg:w-1/2 flex gap-2 sm:gap-4 xl:gap-6 justify-between flex-wrap md:flex-nowrap items-center">
                    <Stat label="min" value={Math.round(e.metrics[0].min)} />
                    <Stat label="max" value={Math.round(e.metrics[0].max)} />
                    <Stat label="p50" value={Math.round(e.metrics[0].p50)} />
                    <Stat label="p95" value={Math.round(e.metrics[0].p95)} />
                    <Stat label="p99" value={Math.round(e.metrics[0].p99)} />
                  </div>
                </div>

                <div className="p-4 flex flex-col space-y-8">
                  <div className="hidden lg:block">
                    <Chart
                      endpoint={e}
                      withAvailability
                      nBuckets={Math.min(72, maxBuckets)}
                    />
                  </div>
                  <div className="lg:hidden">
                    <Chart
                      endpoint={e}
                      withAvailability
                      nBuckets={Math.min(24, maxBuckets)}
                    />
                  </div>



                </div>
              </div>
            </li>
          ))}
        </ul>

      </div>
    </div>

  );
}
