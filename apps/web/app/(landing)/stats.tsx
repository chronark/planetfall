import React from "react";
import { db } from "@planetfall/db";
import { asyncComponent } from "lib/api/component";

import CountingNumbers from "./counting-numbers";
import { Section } from "./section";

export const dynamic = "force-static";
export const revalidate = 3600;

export const Stats = asyncComponent(async () => {
  const stats = await Promise.all([
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
      label: "Checks",
      value: await fetch("https://api.tinybird.co/v0/pipes/average_usage__v1.json", {
        headers: {
          Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`,
        },
      })
        .then(async (res) => (await res.json()) as { data: { usage: number }[] })
        .then((res) => {
          if (!Array.isArray(res.data)) {
            return -1;
          }
          if (res.data.length === 0) {
            return -1;
          }

          return res.data.reduce((acc, { usage }) => acc + usage, 0);
        }),
    },
  ]);
  return (
    <Section id="stats" title="Trusted by">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-y-16 gap-x-8 text-center lg:grid-cols-4">
          {stats.map(({ label, value }) => (
            <div key={label} className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-gray-600">{label}</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                <CountingNumbers value={value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
});
