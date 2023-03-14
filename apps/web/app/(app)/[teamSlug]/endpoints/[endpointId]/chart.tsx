"use client";

import React, { useState } from "react";
import { Bar } from "@ant-design/plots";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import { Card, CardContent, CardHeader, CardHeaderTitle } from "@/components/card";
type Props = {
  regions: {
    regionId: string;
    regionName: string;
  }[];
  endpoint: {
    timeout?: number;
    degradedAfter?: number;
  };
};

export const Chart: React.FC<Props> = ({ regions, endpoint }) => {
  const [selected, setSelected] = useState("p99");
  const [showTopBottom, setShowTopBottom] = useState(regions.length > 10);
  const lookup = regions.reduce((acc, r) => {
    // @ts-ignore
    acc[r.region] = r[selected];
    return acc;
  }, {} as Record<string, number>);
  // @ts-ignore
  const sorted = regions.sort((a, b) => a[selected] - b[selected]);
  const data = showTopBottom ? sorted.slice(0, 5).concat(sorted.slice(-5)) : sorted;

  const regionMap: Record<string, string> = {};
  for (const r of regions) {
    regionMap[r.regionId] = r.regionName;
  }

  return (
    <Card>
      <CardHeader border={false}>
        <CardHeaderTitle title="Latency by Region" />
        <div className="flex items-center justify-end w-full gap-4">
          {regions.length > 10 ? (
            <Select onValueChange={(v) => setShowTopBottom(v === "true")}>
              <SelectTrigger>
                <SelectValue placeholder="Show Best and Worst" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Show Best and Worst</SelectItem>
                <SelectItem value="false">Show All</SelectItem>
              </SelectContent>
            </Select>
          ) : null}
          <Select onValueChange={(v) => setSelected(v)}>
            <SelectTrigger>
              <SelectValue placeholder={selected} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="p75">P75</SelectItem>
              <SelectItem value="p90">P90</SelectItem>
              <SelectItem value="p95">P95</SelectItem>
              <SelectItem value="p99">P99</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Bar
          data={data}
          yField="regionId"
          xField={selected}
          legend={{
            position: "top",
          }}
          color={(datum) => {
            if (endpoint.timeout && lookup[datum.region] > endpoint.timeout) {
              return "#ef4444";
            }
            if (endpoint.degradedAfter && lookup[datum.region] > endpoint.degradedAfter) {
              return "#f97316";
            }
            return "#3366FF";
          }}
          xAxis={{
            maxTickCount: 3,

            title: { text: "Latency (ms)" },
          }}
          yAxis={{
            label: {
              formatter: (regionId, _item, _index) => {
                const name = regionMap[regionId] ?? regionId;
                return `${
                  regionId.startsWith("aws:")
                    ? "λ"
                    : regionId.startsWith("vercelEdge:")
                    ? "▲"
                    : regionId.startsWith("fly:")
                    ? "fly"
                    : ""
                } ${name}`;
              },
            },
          }}
          tooltip={{
            formatter: (datum) => {
              return {
                name: selected,
                value: `${Intl.NumberFormat(undefined).format(Math.round(datum[selected]))} ms`,
              };
            },
          }}
        />
      </CardContent>
    </Card>
  );
};
