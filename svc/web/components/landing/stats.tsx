import React, { Fragment } from "react";
import Image from "next/image";
import Illustration from "../../public/landing/pricing-illustration.svg";
import Link from "next/link";
import { CheckIcon, MinusIcon } from "@heroicons/react/24/solid";
import { GetStaticProps } from "next";
import { PrismaClient } from "@planetfall/db";

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
        <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {/* Trusted by */}
          </p>
        </div>
        <div className="container mx-auto grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stats.map(({ label, value }) => (
            <div
              key={label}
              className="overflow-hidden rounded px-4 py-3  shadow-cta "
            >
              <dt className="text-center text-lg font-medium leading-6  text-slate-500">
                {label}
              </dt>
              <dd className="text-center text-5xl font-bold tracking-tight mt-2 text-slate-900">
                {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </dd>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
