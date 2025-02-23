"use client";

import { Button } from "@/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dropdown";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/hover-card";
import { Loading } from "@/components/loading";
import { ScrollArea, ScrollBar } from "@/components/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import { Text } from "@/components/text";
import { useToast } from "@/components/toast";
import { trpc } from "@/lib/trpc/hooks";
import { Bar, Column, Line } from "@ant-design/plots";
import { AlertCircle, AlertTriangle, FlaskConical, FlaskRound, Zap } from "lucide-react";
import ms from "ms";
import Link from "next/link";
import React, { useEffect, useState } from "react";

type Props = {
  endpoint: {
    id: string;
    timeout?: number;
    degradedAfter?: number;
    regions: {
      id: string;
      name: string;
    }[];
  };
};

const sinceOptions = {
  "1h": "Last hour",
  "6h": "Last 6 hours",
  "1d": "Last 24 hours",
  "3d": "Last 3 days",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};
const granularityOptions = {
  "1h": "1 hour",
  "1d": "1 day",
};

const metricOptions = {
  p75: "P75",
  p90: "P90",
  p95: "P95",
  p99: "P99",
  errors: "Errors",
  count: "Count",
};

export const Analytics: React.FC<Props> = ({ endpoint }) => {
  const regionOptions = endpoint.regions.reduce(
    (acc, r) => {
      acc[r.id] = r.name;
      return acc;
    },
    {
      global: "Global",
    } as Record<string, string>,
  );

  const [since, setSince] = useState<keyof typeof sinceOptions>("7d");
  const [granularity, setGranularity] = useState<keyof typeof granularityOptions>("1d");
  const [metric, setMetric] = useState<keyof typeof metricOptions>("p75");
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>(
    endpoint.regions.map((r) => r.id),
  );
  const { addToast } = useToast();

  const now = new Date().setMinutes(0, 0, 0);

  const { data, error, isLoading } = trpc.tinybird.analytics.useQuery({
    endpointId: endpoint.id,
    since: now - ms(since),
    granularity: granularity,
    regionIds: selectedRegionIds.length > 0 ? selectedRegionIds : ["global"],
    getErrors: metric === "errors",
    getCount: metric === "count",
    getP75: metric === "p75",
    getP90: metric === "p90",
    getP95: metric === "p95",
    getP99: metric === "p99",
  });
  useEffect(() => {
    if (error) {
      addToast({
        title: "Error",
        content: error.message,
        variant: "error",
      });
    }
  }, [error]);

  const series = (data?.data ?? [])
    .sort((a, b) => a.time - b.time)
    .map((s) => ({
      ...s,
      regionName: regionOptions[s.regionId] ?? s.regionId,
      time: new Date(s.time).toUTCString(),
    }));

  return (
    <Card>
      <CardHeader
        actions={[
          <Select key="since" onValueChange={(v: keyof typeof sinceOptions) => setSince(v)}>
            <SelectTrigger>
              <SelectValue defaultValue={"7d"} placeholder={sinceOptions["7d"]} />
            </SelectTrigger>
            <SelectContent>
              <DropdownMenuLabel>Time Range</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(sinceOptions).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>,

          <Select key="metric" onValueChange={(v: keyof typeof metricOptions) => setMetric(v)}>
            <SelectTrigger>
              <SelectValue defaultValue="p75" placeholder={metricOptions["p75"]} />
            </SelectTrigger>
            <SelectContent>
              <DropdownMenuLabel>Metric</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(metricOptions).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>,

          <DropdownMenu key="regions">
            <DropdownMenuTrigger asChild>
              <Button>
                {selectedRegionIds.length > 0 ? `Regions (${selectedRegionIds.length})` : "Global"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <ScrollArea className="max-h-96">
                <DropdownMenuLabel>Regions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {endpoint.regions.map((r) => (
                  <DropdownMenuCheckboxItem
                    key={r.id}
                    checked={selectedRegionIds.includes(r.id)}
                    onCheckedChange={(v) => {
                      if (v) {
                        setSelectedRegionIds([...selectedRegionIds, r.id]);
                      } else {
                        setSelectedRegionIds(selectedRegionIds.filter((id) => id !== r.id));
                      }
                    }}
                  >
                    {r.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>,
          <Select
            key="granularity"
            onValueChange={(v: keyof typeof granularityOptions) => setGranularity(v)}
          >
            <SelectTrigger>
              <SelectValue defaultValue="1d" placeholder={granularityOptions["1d"]} />
            </SelectTrigger>
            <SelectContent>
              <DropdownMenuLabel>Data Granularity</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(granularityOptions).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>,
        ]}
      >
        <CardTitle>Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? <Loading /> : null}
        <Line
          data={series}
          yField={metric}
          xField="time"
          smooth={true}
          // isGroup={selectedRegionIds.length >= 2}
          seriesField="regionName"
          legend={{
            position: "top",
          }}
          // color={(_datum) => {
          //   return "#3366FF";
          // }}
          yAxis={{
            maxTickCount: 3,
            label: {
              formatter: (value, _item, _index) => {
                return Intl.NumberFormat(undefined, { notation: "compact" }).format(Number(value));
              },
            },
            title: {
              text: ["p75", "p90", "p95", "p99"].includes(metric) ? "Latency (ms)" : "Count",
            },
          }}
          // yAxis={{
          //   label: {
          //     formatter: (regionId, _item, _index) => {
          //       const name = regionMap[regionId] ?? regionId;
          //       return `${regionId.startsWith("aws:")
          //         ? "λ"
          //         : regionId.startsWith("vercelEdge:")
          //           ? "▲"
          //           : regionId.startsWith("fly:")
          //             ? "fly"
          //             : ""
          //         } ${name}`;
          //     },
          //   },
          // }}
          tooltip={{
            customItems: (items) => {
              return items.sort((a, b) => b.data[metric] - a.data[metric]);
            },
            formatter: (datum) => {
              return {
                name: datum.regionName,
                value: `${Intl.NumberFormat(undefined).format(Math.round(datum[metric]))}${
                  ["p75", "p90", "p95", "p99"].includes(metric) ? " ms" : ""
                }`,
              };
            },
          }}
        />
      </CardContent>
    </Card>
  );
};
