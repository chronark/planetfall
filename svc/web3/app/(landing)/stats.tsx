import React from "react";
import { db } from "@planetfall/db"
import { asyncComponent } from "lib/api/component";

export const revalidate = 60 * 60 // revalidate every hour

export const Stats = asyncComponent(async () => {
  const rng = Math.random()
  console.time("stats"+rng)
  const stats = await Promise.all([
    {
      label: "Teams",
      value: await db.team.count(),
    },
    {
      label: "APIs",
      value: await db.endpoint.count(),
    },
    //  {
    //    label: "Ø Checks Per Second",
    //    value: await db.check.count() / 24 / 60 / 60,
    //  },
  ])
  console.timeEnd("stats"+rng)
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
})