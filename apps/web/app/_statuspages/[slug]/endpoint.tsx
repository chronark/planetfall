"use client";

import { Heading } from "@/components/heading";
// import { div, div, div } from "@/components/div";
import cn from "classnames";
import { EndpointData } from "./types";
import { AvailabilityChart } from "./availabilityChart";
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


export const Endpoint: React.FC<{
  endpoint: EndpointData
  degradedAfter?: number
}> = ({ endpoint, degradedAfter }) => {

  const globalStats = endpoint.regions["global"]
  const totalChecks = globalStats.count;
  const errors = globalStats.errors

  let availability = (totalChecks === 0 ? 1 : 1 - errors / totalChecks) * 100
  // Availability should not be rounded to 100% if there are errors
  if (errors > 0) {
    availability = Math.min(availability, 99.99)
  }

  const currentMetrics = globalStats.series.at(-1)
  if (!currentMetrics) {
    console.error("No current metrics", { globalStats, endpoint })
    return null
  }
  const currentState = currentMetrics.errors > 0 ? "Error"
    : degradedAfter && currentMetrics.p75 > degradedAfter ? "Degraded"
      : "Operational";

  const max = Math.max(...globalStats.series.map((s) => s.p75))
  return (
    <div className="w-full p-2 rounded-lg ring-1 ring-inset ring-zinc-900/10 bg-zinc-900/5 ">
      <div className="bg-white rounded shadow-2xl ring-1 ring-zinc-900/10 p-4">
        <div className="flex items-center justify-between w-full gap-4 md:gap-8">
          <div className="flex flex-col items-start justify-between w-full gap-2 md:items-center md:flex-row">
            <Heading h3>{endpoint.name}</Heading>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-4">
              <Stat label="p75" value={globalStats.p75} />
              <Stat label="p90" value={globalStats.p90} />
              <Stat label="p95" value={globalStats.p95} />
              <Stat label="p99" value={globalStats.p99} />
            </div>
          </div>

          <div className="flex flex-col-reverse items-end gap-4 md:items-center md:flex-row">
            <span className="whitespace-nowrap leading-7 text-zinc-900 text-sm">
              {(availability).toFixed(2)} % Availability
            </span>

            <div className="flex items-center gap-2 px-3 py-1 border rounded-full border-zinc-300">
              <div
                className={cn("w-2.5 h-2.5 rounded-full", {
                  "bg-primary-500": currentState === "Operational",
                  "bg-yellow-500": currentState === "Degraded",
                  "bg-red-500": currentState === "Error",
                })}
              />
              <span className="text-sm font-medium">{currentState}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-2 ">
          <div className="sm:hidden">
            <AvailabilityChart
              days={30}
              max={max}
              endpoint={endpoint}
              degradedAfter={degradedAfter}
            />
          </div>
          <div className="hidden sm:block md:hidden">
            <AvailabilityChart
              days={60}
              max={max}
              endpoint={endpoint}
              degradedAfter={degradedAfter}
            />
          </div>
          <div className="hidden md:block">
            <AvailabilityChart
              days={90}
              max={max}
              endpoint={endpoint}
              degradedAfter={degradedAfter}
            />
          </div>
        </div>



      </div>
    </div>
  );
};
