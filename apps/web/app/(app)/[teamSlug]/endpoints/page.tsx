import PageHeader from "@/components/page/header";
import { redirect } from "next/navigation";
import { getEndpointStatsGlobally } from "@planetfall/tinybird";

import { Text } from "@/components/text";
import { Button } from "@/components/button";
import { db } from "@planetfall/db";
import { auth } from "@clerk/nextjs/app-beta";
import Link from "next/link";
import { Card } from "@/components/card";
import {  ChevronRight, Plus } from "lucide-react";
import classNames from "classnames";

const countFormat = (n: number) =>
  Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(n);
const latencyFormat = (n: number) =>
  Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(n);

export default async function Page(props: { params: { teamSlug: string } }) {
  const { userId } = auth();
  if (!userId) {
    return redirect("/auth/sign-in");
  }

  const team = await db.team.findUnique({
    where: { slug: props.params.teamSlug },
    include: { endpoints: true },
  });
  if (!team) {
    console.warn(__filename, "Team not found");

    return redirect("/home");
  }

  const endpointStats = await Promise.all(
    team?.endpoints.map(async (endpoint) => {
      const stats = await getEndpointStatsGlobally({ endpointId: endpoint.id });
      return {
        id: endpoint.id,
        name: endpoint.name,
        url: endpoint.url,
        stats: stats.data.at(0) ?? {
          count: 0,
          p75: 0,
          p90: 0,
          p95: 0,
          p99: 0,
          errors: 0,
        },
      };
    }),
  );

  const endpointsByHost = endpointStats.reduce(
    (acc, endpoint) => {
      const host = new URL(endpoint.url).host;
      if (!acc[host]) {
        acc[host] = [];
      }
      acc[host].push(endpoint);
      return acc;
    },
    {} as Record<
      string,
      {
        id: string;
        name: string;
        url: string;
        stats: {
          count: number;
          p75: number;
          p90: number;
          p95: number;
          p99: number;
          errors: number;
        };
      }[]
    >,
  );

  return (
    <div>
      <PageHeader
        sticky={true}
        title="Endpoints"
        description="Aggregated over the last 24 hours"
        actions={[
          <Link key="new" href={`/${team.slug}/endpoints/new`}>
            <Button>New Endpoint</Button>
          </Link>,
        ]}
      />
      <main className="container mx-auto">
        {team.endpoints.length === 0 ? (
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
            {Object.entries(endpointsByHost).map(([host, endpoints]) => (
              <Card key={host}>
                <div className="divide-y divide-zinc-200">
                  {endpoints.map((endpoint) => (
                    <Link
                      key={endpoint.id}
                      href={`/${team.slug}/endpoints/${endpoint.id}`}
                      className=" hover:bg-zinc-50 flex items-center px-4 py-4 md:px-6"
                    >
                      <div className="flex flex-1 flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-col items-start w-full md:w-1/2 ">
                          <span className="text-sm font-medium text-zinc-900">{endpoint.name}</span>
                          <span className="text-sm text-zinc-500">{endpoint.url}</span>
                          <span className="text-xs text-zinc-400">
                            <span className="font-medium">{countFormat(endpoint.stats.count)}</span>{" "}
                            Checks in the last 24h
                          </span>
                        </div>
                        <div className="w-full md:w-1/2  grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-8">
                          <Metric
                            label="Errors"
                            value={countFormat(endpoint.stats.errors)}
                            alert={endpoint.stats.errors > 0}
                          />
                          <Metric label="P70" value={latencyFormat(endpoint.stats.p75)} unit="ms" />
                          <Metric label="P90" value={latencyFormat(endpoint.stats.p90)} unit="ms" />
                          <Metric label="P95" value={latencyFormat(endpoint.stats.p95)} unit="ms" />
                          <Metric label="P99" value={latencyFormat(endpoint.stats.p99)} unit="ms" />
                        </div>
                      </div>
                      <div className="ml-5 flex-shrink-0">
                        <ChevronRight className="h-5 w-5 text-zinc-400" aria-hidden="true" />
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const Metric: React.FC<{ label?: string; value: string; unit?: string; alert?: boolean }> = ({
  label,
  value,
  unit,
  alert,
}) => (
  <div>
    <div
      className={classNames(
        "justify-start gap-1   text-sm flex grow-0 border items-baseline  whitespace-nowrap  rounded px-2 py-1",
        {
          "text-zinc-700 bg-zinc-50 border-zinc-100  lg:bg-transparent lg:border-transparent":
            !alert,
          "text-red-500 bg-red-50 border-red-500": alert,
        },
      )}
    >
      {label ? <span className="font-medium">{label}</span> : null}

      <span className="text-sm grow  text-right">{value}</span>
      <span className="text-xs">{unit}</span>
    </div>
  </div>
);
