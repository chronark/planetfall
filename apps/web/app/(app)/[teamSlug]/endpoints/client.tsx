"use client";

import { Card } from "@/components/card";
import { ChevronRight, Plus } from "lucide-react";
import { Status } from "./status";
import Link from "next/link";
import { PageHeader } from "@/components/page";
import { Button } from "@/components/button";
import { Text } from "@/components/text";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";

const countFormat = (n: number) =>
  Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(n);
const latencyFormat = (n: number) =>
  Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(n);

type Props = {
  user: {
    id: string;
  };
  team: {
    slug: string;
    endpoints: number;
  };
  endpoints: Record<
    string,
    {
      id: string;
      name: string;
      url: string;
      active: boolean;
      degradedAfter?: number;
      ownerId?: string;
      stats: {
        count: number;
        p75: number;
        p90: number;
        p95: number;
        p99: number;
        errors: number;
      };
    }[]
  >;
};

type Filter = "all" | "owned";
export const ClientPage: React.FC<Props> = ({ endpoints, team, user }) => {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered =
    filter === "all"
      ? endpoints
      : Object.entries(endpoints).reduce((acc, [host, endpoints]) => {
          for (const e of endpoints) {
            const shouldAdd = e.ownerId === user.id;
            console.log("Adding", e.name, shouldAdd);
            if (shouldAdd) {
              if (!acc[host]) {
                acc[host] = [];
              }
              acc[host].push(e);
            }
          }

          return acc;
        }, {} as Props["endpoints"]);
  return (
    <div>
      <PageHeader
        sticky={true}
        title="Endpoints"
        description="Aggregated over the last 24 hours"
        actions={[
          <Select key="filter" onValueChange={(v) => setFilter(v as Filter)}>
            <SelectTrigger>
              <SelectValue defaultValue="all" placeholder="Show All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Show All</SelectItem>
              <SelectItem value="owned">Show Owned</SelectItem>
            </SelectContent>
          </Select>,
          <Link key="new" href={`/${team.slug}/endpoints/new`}>
            <Button>New Endpoint</Button>
          </Link>,
        ]}
      />
      <main className="container mx-auto">
        {team.endpoints === 0 ? (
          <div
            key="x"
            className="flex flex-col items-center justify-center max-w-sm p-4 mx-auto md:p-8"
          >
            <Text>You don&apos;t have any endpoints yet.</Text>
            <Button size="lg" className="flex items-center gap-2 mt-2 ">
              <Plus className="w-5 h-5" />
              <Link href={`/${team.slug}/endpoints/new`}>Create your first Endpoint</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 lg:gap-8 ">
            {Object.entries(filtered).map(([host, endpoints]) => (
              <Card key={host}>
                <div className="divide-y divide-zinc-200">
                  {endpoints.map((endpoint) => {
                    return (
                      <Link
                        key={endpoint.id}
                        href={`/${team.slug}/endpoints/${endpoint.id}`}
                        className="flex items-center px-4 py-4 hover:bg-zinc-50 md:px-6"
                      >
                        <div className="flex flex-col flex-1 md:flex-row md:items-center md:justify-between">
                          <div className="flex flex-col items-start w-full md:w-1/2 ">
                            <div className="flex items-center gap-1 ">
                              <Status
                                status={
                                  !endpoint.active
                                    ? "stopped"
                                    : endpoint.stats.errors > 0
                                    ? "error"
                                    : endpoint.degradedAfter &&
                                      endpoint.stats.p99 > endpoint.degradedAfter
                                    ? "degraded"
                                    : "healthy"
                                }
                              />

                              <span className="text-sm font-medium text-zinc-900">
                                {endpoint.name}
                              </span>
                            </div>
                            <span className="text-sm text-zinc-500">{endpoint.url}</span>
                            <span className="text-xs text-zinc-400">
                              <span className="font-medium">
                                {countFormat(endpoint.stats.count)}
                              </span>{" "}
                              Checks in the last 24h
                            </span>
                          </div>
                          <div className="grid w-full grid-cols-2 gap-2 md:w-1/2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 ">
                            <Metric
                              label="P75"
                              value={latencyFormat(endpoint.stats.p75)}
                              unit="ms"
                            />
                            <Metric
                              label="P90"
                              value={latencyFormat(endpoint.stats.p90)}
                              unit="ms"
                            />
                            <Metric
                              label="P95"
                              value={latencyFormat(endpoint.stats.p95)}
                              unit="ms"
                            />
                            <Metric
                              label="P99"
                              value={latencyFormat(endpoint.stats.p99)}
                              unit="ms"
                            />
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-5">
                          <ChevronRight className="w-5 h-5 text-zinc-400" aria-hidden="true" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; unit: string }> = ({
  label,
  value,
  unit,
}) => (
  <div className="justify-start gap-1 max-w-[7rem]   text-sm flex grow-0 border items-baseline  whitespace-nowrap  rounded px-2 py-1 text-zinc-700 bg-zinc-50 border-zinc-100  lg:bg-transparent lg:border-transparent">
    <span className="font-medium">{label}</span>

    <span className="text-sm text-right grow">{value}</span>
    <span className="text-xs">{unit}</span>
  </div>
);
