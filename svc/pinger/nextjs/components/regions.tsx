import { Series } from "@lib/types";
import clsx from "clsx";
import React from "react";
import { Chart } from "./chart";
import { LatencyStats } from "./latency-stats";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

export type Region = {
  id: string;
  name: string;
  series: Series;
};

export type RegionsProps = {
  regions: Region[];
};

const BreadCrumbs: React.FC<{ crumbs: string[] }> = ({ crumbs }) => {
  return (
    <ol role="list" className="flex items-center space-x-4">
      {crumbs.map((crumb, i) => (
        <li key={crumb}>
          <div className="flex items-center">
            <ChevronRightIcon
              className="h-5 w-5 flex-shrink-0 text-slate-400"
              aria-hidden="true"
            />
            <span className="ml-4 text-sm font-medium text-slate-500 hover:text-slate-700">
              {crumb}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
};

export const Regions: React.FC<RegionsProps> = ({ regions }) => {
  return (
    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <ul
        role="list"
        className="mt-5 divide-y divide-slate-200 border-t border-slate-200 sm:mt-0 sm:border-t-0"
      >
        {regions.map((region) => (
          <li key={region.id} id={region.id}>
            <div className="flex items-center py-5 px-4 sm:py-8 sm:px-0">
              <div className="min-w-0 items-center w-full space-y-4">
                <div className="flex items-start md:items-center flex-col md:flex-row justify-between w-full space-y-2 md:space-y-0 md:space-x-4">
                  <h2 className="flex flex-1 items-center space-x-4">
                    <span
                      className={clsx(
                        "border-l-4 font-medium px-4 py-1 text-xl text-slate-900 sm:truncate sm:text-2xl uppercase",
                        {
                          "border-slate-200": region.series.p95 <= 0,
                          "border-rose-400": region.series.p95 > 300,
                          " border-amber-300": region.series.p95 <= 300 &&
                            region.series.p95 > 100,
                          " border-emerald-400": region.series.p95 >= 0 &&
                            region.series.p95 <= 100,
                        },
                      )}
                    >
                      {region.id}
                    </span>
                  </h2>

                  <LatencyStats series={region.series} />
                </div>
                <Chart series={region.series} />
              </div>
              {
                /* <div>
                                  <ChevronRightIcon
                                    className="h-5 w-5 text-slate-400 group-hover:text-slate-700"
                                    aria-hidden="true"
                                  />
                                </div> */
              }
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
