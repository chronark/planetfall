"use client";

import { Button } from "@/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Heading } from "@/components/heading";
import { AwsLambda } from "@/components/icons/AwsLambda";
import { Fly } from "@/components/icons/Fly";
import { VercelEdge } from "@/components/icons/VercelEdge";
import { MultiSelect } from "@/components/multiselect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import { Text } from "@/components/text";
import { Area, Line } from "@ant-design/plots";
import type { Check } from "@planetfall/tinybird";
import { Region } from "@prisma/client";
import Link from "next/link";
import { useMemo, useState } from "react";

type Props = {
  checks: Check[];
  endpoint: {
    timeout: number | null;
    degradedAfter: number | null;
    regions: Region[];
  };
  team: {
    slug: string;
  };
};

function regionIdToName(regions: Region[], regionId: string) {
  return regions.find((r) => r.id === regionId)?.name ?? regionId;
}

export const ChartsSection: React.FC<Props> = ({ endpoint, checks, team }) => {
  const [selectedRegion, setSelectedRegion] = useState(checks[0].regionId);

  const checksByRegion = useMemo(() => {
    return checks
      .filter((check) => check.regionId === selectedRegion)
      .sort((a, b) => a.time - b.time);
  }, [checks, selectedRegion]);

  return (
    <Card>
      <CardHeader
        actions={[
          <Select
            key="region"
            onValueChange={(v) => setSelectedRegion(v)}
            defaultValue={selectedRegion}
          >
            <SelectTrigger>
              <SelectValue defaultValue={selectedRegion} />
            </SelectTrigger>
            <SelectContent>
              {endpoint.regions.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  <div className="flex items-center gap-1">
                    {r.id.startsWith("aws:") ? (
                      <AwsLambda className="w-4 h-4" />
                    ) : r.id.startsWith("vercelEdge:") ? (
                      <VercelEdge className="w-4 h-4" />
                    ) : r.id.startsWith("fly:") ? (
                      <Fly className="w-4 h-4" />
                    ) : null}
                    {r.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>,
        ]}
      >
        <CardTitle>Latency</CardTitle>
      </CardHeader>
      <CardContent>
        <Chart endpoint={endpoint} checks={checksByRegion} team={team} />
      </CardContent>
    </Card>
  );
};

function toRGBA(color: number[], alpha = 1) {
  return `rgba(${color.join(",")},${alpha})`;
}

type ChartProps = {
  endpoint: {
    timeout: number | null;
    degradedAfter: number | null;
  };
  checks: Check[];
};

const Chart: React.FC<Props> = ({ endpoint, checks, team }) => {
  const colors = {
    success: [59, 130, 246],
    degraded: [259, 115, 22],
    failed: [239, 68, 68],
  };

  let state: keyof typeof colors = "success";
  for (const check of checks) {
    if (check.latency && endpoint.timeout && check.latency > endpoint.timeout) {
      state = "failed";
      break;
    }
    if (check.latency && endpoint.degradedAfter && check.latency > endpoint.degradedAfter) {
      state = "degraded";
      break;
    }
  }
  const max = Math.max(...checks.map((c) => c.latency ?? 0));
  const annotations: any = [];

  if (endpoint.timeout && max > endpoint.timeout) {
    annotations.push({
      type: "line",
      start: ["min", endpoint.timeout],
      end: ["max", endpoint.timeout],
      text: {
        content: "Timeout",
        offsetY: -2,
        style: {
          textAlign: "left",
          fontSize: 10,
          fill: colors.failed,
          textBaseline: "bottom",
        },
      },
      style: {
        stroke: toRGBA(colors.failed, 0.5),
      },
    });
  }
  if (endpoint.degradedAfter && max > endpoint.degradedAfter) {
    annotations.push({
      type: "line",
      start: ["min", endpoint.degradedAfter],
      end: ["max", endpoint.degradedAfter],
      text: {
        content: "Degraded",
        offsetY: -2,
        style: {
          textAlign: "left",
          fontSize: 10,
          fill: colors.degraded,
          textBaseline: "bottom",
        },
      },
      style: {
        stroke: toRGBA(colors.degraded, 0.5),
      },
    });
  }

  return (
    <Line
      data={checks.map((c) => ({
        id: c.id,
        latency: c.latency ?? 0,
        time: new Date(c.time).toUTCString(),
      }))}
      xField="time"
      yField="latency"
      smooth={true}
      annotations={annotations}
      // line={{
      // 	color: toRGBA(colors[state]),
      // }}
      autoFit={true}
      color={toRGBA(colors[state])}
      xAxis={{
        title: { text: "Time" },
        maxTickCount: 5,
      }}
      yAxis={{
        maxTickCount: 5,
        title: { text: "Latency (ms)" },
      }}
      tooltip={{
        enterable: true,
        customContent: (time, data) => {
          return (
            <div className="p-2">
              <div>{new Date(time).toUTCString()}</div>
              <div className="flex items-center justify-between gap-1 mt-2">
                <Text size="sm" variant="subtle">
                  Latency:
                </Text>
                <Text size="lg" variant="lead">{`${Intl.NumberFormat(undefined).format(
                  Math.round(data.at(0)?.data.latency),
                )} ms`}</Text>
              </div>
              <div className="flex items-center justify-center w-full mt-2">
                <Link href={`/${team.slug}/checks/${data.at(0)?.data.id}`}>
                  <Button variant="ghost" size="sm">
                    Go to check
                  </Button>
                </Link>
              </div>
            </div>
          );
        },
      }}
    />
  );
};
