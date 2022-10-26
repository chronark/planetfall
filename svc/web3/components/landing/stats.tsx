import React, { Fragment } from "react";
import { CheckIcon, MinusIcon } from "@heroicons/react/24/solid";

export type StatsProps = {
  checks: number;
  endpoints: number;
  teams: number;
};
export const Stats: React.FC<StatsProps> = (
  { checks, endpoints, teams },
): JSX.Element => {
  const stats = [
    {
      label: "Teams",
      value: teams,
    },
    {
      label: "APIs",
      value: endpoints,
    },
    {
      label: "Ø Checks Per Second",
      value: checks,
    },
  ];
  return (
    <section id="stats">
      <div className="relative py-16 sm:py-24 lg:py-32">
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(({ label, value }) => (
            <div
              key={label}
              className="overflow-hidden rounded px-4 m py-3 flex sm:flex-col items-center justify-between gap-2"
            >
              <dt className="text-center  text-lg leading-6  text-slate-500">
                {label}
              </dt>
              <dd className="text-center text-2xl  sm:text-5xl font-bold tracking-tight text-slate-100">
                {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </dd>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
