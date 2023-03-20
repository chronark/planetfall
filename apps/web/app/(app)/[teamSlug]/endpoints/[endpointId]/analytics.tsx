"use client";

import React, { useEffect, useState } from "react";
import { Bar, Column, Line } from "@ant-design/plots";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import { Card, CardContent, CardHeader, CardHeaderTitle } from "@/components/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dropdown";
import { Button } from "@/components/button";
import { Text } from "@/components/text";
import { AlertCircle, AlertTriangle, FlaskConical, FlaskRound, Zap } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/utils/trpc";
import ms from "ms";
import useSWR from "swr";
import { Loading } from "@/components/loading";
import { useToast } from "@/components/toast";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/hover-card";

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
  count: "Checks",
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

  const [since, setSince] = useState<keyof typeof sinceOptions>("1d");
  const [granularity, setGranularity] = useState<keyof typeof granularityOptions>("1d");
  const [metric, setMetric] = useState<keyof typeof metricOptions>("count");
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([]);
  const { addToast } = useToast();

  const now = new Date().setMinutes(0, 0, 0);
  const req = {
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
  };

  const { data, error, isLoading } = useSWR(req, trpc.tinybird.analytics.query);
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
      <CardHeader border={false}>
        <CardHeaderTitle
          title="Analytics"
          subtitle={
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex items-center gap-2 px-2 py-1 rounded-full border bg-primary-100/20 border-primary-500 max-w-min">
                  <FlaskConical className="w-3 h-3 text-primary-500" />
                  <span className="text-xs text-primary-500">Experimental</span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent>
                <Text variant="subtle" size="sm">
                  Please report bugs to{" "}
                  <Link href="mailto:support@planetfall.io" className="underline">
                    support@planetfall.io
                  </Link>
                </Text>
              </HoverCardContent>
            </HoverCard>
          }
        />
        <div className="flex items-center justify-end w-full gap-4">
          <Select onValueChange={(v: keyof typeof sinceOptions) => setSince(v)}>
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
          </Select>

          <Select onValueChange={(v: keyof typeof metricOptions) => setMetric(v)}>
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
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                {selectedRegionIds.length > 0 ? `Regions (${selectedRegionIds.length})` : "Global"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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
            </DropdownMenuContent>
          </DropdownMenu>
          <Select onValueChange={(v: keyof typeof granularityOptions) => setGranularity(v)}>
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
          </Select>
        </div>
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
          // tooltip={{
          //   formatter: (datum) => {
          //     return {
          //       name: selected,
          //       value: `${Intl.NumberFormat(undefined).format(Math.round(datum[selected]))} ms`,
          //     };
          //   },
          // }}
        />
      </CardContent>
    </Card>
  );
};
