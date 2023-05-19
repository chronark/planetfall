import React from "react";
import { db } from "@planetfall/db";

import CountingNumbers from "./counting-numbers";
import { Section } from "./section";
import { asyncComponent } from "@/components/async-component";
import { globalUsage } from "@planetfall/tinybird";
import { unstable_cache } from "next/cache";

export const Stats = asyncComponent(async () => {
  const stats = await unstable_cache(
    async () =>
      Promise.all([
        {
          label: "Teams",
          value: await db.team.count(),
        },
        {
          label: "Endpoints",
          value: await db.endpoint.count(),
        },
        {
          label: "Status Pages",
          value: await db.statusPage.count(),
        },
        {
          label: "Ø Checks per Day",
          value: (await globalUsage({})).data.reduce((acc, day) => acc + day.usage, 7),
        },
      ]),
    [],
    {
      revalidate: 3600,
    },
  )();
  return (
    <Section id="stats" title="Currently Monitoring">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <dl className="grid grid-cols-1 text-center gap-y-16 gap-x-8 sm:grid-cols-2 md:grid-cols-4">
          {stats.map(({ label, value }) => (
            <div key={label} className="flex flex-col max-w-xs mx-auto gap-y-4">
              <dt className="text-base leading-7 text-gray-600">{label}</dt>
              <dd className="order-first text-5xl font-semibold tracking-tight text-gray-900">
                <CountingNumbers value={value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
});
