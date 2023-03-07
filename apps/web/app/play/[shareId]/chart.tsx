"use client";

import React from "react";
import { Column } from "@ant-design/plots";
import { PlayChecks } from "lib/server/routers/play";

type Props = {
  regions: PlayChecks["regions"];
  urls: PlayChecks["urls"];
};

const defaultStyle = {
  columnStyle: {
    radius: [2, 2, 0, 0],
  },
};
export const Chart: React.FC<Props> = ({ regions, urls }) => {
  const regionMap: Record<string, string> = {};
  for (const region of regions) {
    regionMap[region.id] = region.name;
  }
  if (regions[0].checks.length > 1) {
    const data = regions

    .flatMap((r) => [
      {
        url: urls[0],
        regionId: r.id,
        latency: r.checks[0]?.latency ?? -1,
      },
      {
        url: urls[1],
        regionId: r.id,
        latency: r.checks[1]?.latency ?? -1,
      },
    ]);
    return (
      <Column
        {...defaultStyle}
        data={data}
        isGroup={true}
        isStack={false}
        xField="regionId"
        yField="latency"
        seriesField="url"
        xAxis={{
          title: { text: "Regions" },
          label: {
            autoRotate: true,
            formatter: (regionId, _item, _index) => {
              const name = regionMap[regionId] ?? regionId;
              return `${
                regionId.startsWith("aws:") ? "λ" : regionId.startsWith("vercelEdge:") ? "ε" : ""
              } ${name}`;
            },
          },
        }}
        yAxis={{
          maxTickCount: 3,
          title: { text: "Latency (ms)" },
        }}
        color={["#3b82f6", "#ef4444"]}
        tooltip={{
          formatter: (datum) => ({
            name: regionMap[datum.regionId] ?? datum.regionId,
            value: `${datum.latency} ms`,
          }),
        }}
      />
    );
  } else {
    return (
      <Column
        {...defaultStyle}
        data={regions.map((r) => ({
          regionId: r.id,
          Latency: r.checks[0].latency!,
        }))}
        xField="regionId"
        yField="Latency"
        color={["#3366FF"]}
        seriesField="regionId"
        legend={false}
        xAxis={{
          title: { text: "Regions" },
          label: {
            autoRotate: true,
            formatter: (regionId, _item, _index) => {
              const name = regionMap[regionId] ?? regionId;
              return `${regionId.startsWith("aws:") ? "λ" : "ε"} ${name}`;
            },
          },
        }}
        yAxis={{
          maxTickCount: 3,

          title: { text: "Latency (ms)" },
        }}
        tooltip={{
          formatter: (datum) => ({
            name: regionMap[datum.regionId] ?? datum.regionId,
            value: `${datum.Latency} ms`,
          }),
        }}
      />
    );
  }
};
