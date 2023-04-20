import PageHeader from "@/components/page/header";
import { redirect } from "next/navigation";
import { Client as Tinybird, getEndpointStats, getErrors } from "@planetfall/tinybird";

import { db } from "@planetfall/db";
import { Stats } from "@/components/stats";
import { ErrorsTable } from "./errors/table";
import { Heading } from "@/components/heading";
import { LatestTable } from "./latest-table";
import { DeleteButton } from "./delete";
import { auth } from "@clerk/nextjs/app-beta";
import { Button } from "@/components/button";
import { Toggle } from "./toggle";
import { Text } from "@/components/text";
import { ChartsSection } from "./chart-by-region";
import Link from "next/link";
import { Switch } from "@/components/switch";
import { Chart } from "./chart";
import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Divider } from "@/components/divider";
import classNames from "classnames";
import { Analytics } from "./analytics";

export async function generateMetadata({
  params,
}: { params: { teamSlug: string; endpointId: string } }): Promise<Metadata> {
  const endpoint = await db.endpoint.findUnique({
    where: {
      id: params.endpointId,
    },
  });
  if (!endpoint) {
    return {};
  }
  const title = `${endpoint.name} on Planetfall`;
  const description = "Global Latency Monitoring";

  const imageUrl = new URL("https://planetfall.io/api/v1/og/endpoint");
  imageUrl.searchParams.set("name", endpoint.name);
  imageUrl.searchParams.set("id", endpoint.id);
  return {
    title,
    openGraph: {
      title,
      type: "website",
      images: [{ url: imageUrl.toString() }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl.toString()],
    },
  };
}

export const revalidate = 10;

export default async function Page(props: {
  params: { teamSlug: string; endpointId: string };
}) {
  const { userId } = auth();
  if (!userId) {
    return redirect("/auth/sign-in");
  }

  const endpoint = await db.endpoint.findUnique({
    where: {
      id: props.params.endpointId,
    },
    include: {
      regions: true,
      team: {
        include: {
          members: true,
        },
      },
    },
  });
  if (!endpoint || endpoint.deletedAt) {
    redirect(`/${props.params.teamSlug}/endpoints`);
  }

  if (
    endpoint.team.slug !== props.params.teamSlug ||
    !endpoint.team.members.find((m) => m.userId === userId)
  ) {
    throw new Error("Access denied");
  }

  const tb = new Tinybird();

  const [stats, checks, errors] = await Promise.all([
    getEndpointStats({ endpointId: endpoint.id }),
    tb.getLatestChecksByEndpoint(endpoint.id, { limit: 100000 }),
    (
      await getErrors({ endpointId: endpoint.id, since: Date.now() - 24 * 60 * 60 * 1000 })
    ).data.map((e) => ({
      id: e.id,
      time: e.time,
      error: e.error!,
      latency: e.latency,
      region: endpoint.regions.find((r) => r.id === e.regionId)?.name ?? e.regionId,
    })),
  ]);

  const globalStats = stats.data.find((s) => s.regionId === "global") ?? {
    count: 0,
    latency: 0,
    p75: 0,
    p90: 0,
    p95: 0,
    p99: 0,
  };

  const availability = globalStats.count > 0 ? 1 - errors.length / globalStats.count : 1;
  const degraded =
    checks && checks.length > 0
      ? (endpoint.degradedAfter
          ? checks.filter((d) => d.latency && d.latency >= endpoint.degradedAfter!).length
          : 0) / checks.length
      : 1;

  return (
    <div>
      <PageHeader
        sticky={true}
        title={endpoint.name}
        description={endpoint.url}
        actions={[
          <Toggle key="toggle" endpointId={endpoint.id} active={endpoint.active} />,
          <Link
            key="settings"
            href={`/${props.params.teamSlug}/endpoints/${props.params.endpointId}/settings`}
          >
            <Button>Settings</Button>
          </Link>,
          <DeleteButton
            key="delete"
            endpointId={endpoint.id}
            endpointName={endpoint.name}
            endpointUrl={endpoint.url}
          />,
        ]}
      />
      <main className="container mx-auto">
        <div className="pt-2 mb-4 md:pt-4 lg:pt-8 md:mb-8 lg:mb-16">
          <div>
            <div
              className={classNames("grid w-full grid-cols-3 gap-2  md:gap-4 lg:gap-8", {
                "lg:grid-cols-7": endpoint.degradedAfter,
                "lg:grid-cols-6": !endpoint.degradedAfter,
              })}
            >
              <Stats
                label="Availability"
                value={(availability * 100).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
                suffix="%"
              />
              {endpoint.degradedAfter ? (
                <Stats
                  label="Degraded"
                  value={(degraded * 100).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                  suffix="%"
                  status={degraded > 0 ? "warn" : undefined}
                />
              ) : null}
              <Stats label="Errors" value={errors.length.toLocaleString()} />
              <Stats
                label="P75"
                value={globalStats.p75.toLocaleString()}
                suffix="ms"
                status={
                  endpoint.timeout && globalStats.p75 > endpoint.timeout
                    ? "error"
                    : endpoint.degradedAfter && globalStats.p75 > endpoint.degradedAfter
                    ? "warn"
                    : undefined
                }
              />
              <Stats
                label="P90"
                value={globalStats.p90.toLocaleString()}
                suffix="ms"
                status={
                  endpoint.timeout && globalStats.p90 > endpoint.timeout
                    ? "error"
                    : endpoint.degradedAfter && globalStats.p90 > endpoint.degradedAfter
                    ? "warn"
                    : undefined
                }
              />
              <Stats
                label="P95"
                value={globalStats.p95.toLocaleString()}
                suffix="ms"
                status={
                  endpoint.timeout && globalStats.p95 > endpoint.timeout
                    ? "error"
                    : endpoint.degradedAfter && globalStats.p95 > endpoint.degradedAfter
                    ? "warn"
                    : undefined
                }
              />
              <Stats
                label="P99"
                value={globalStats.p99.toLocaleString()}
                suffix="ms"
                status={
                  endpoint.timeout && globalStats.p99 > endpoint.timeout
                    ? "error"
                    : endpoint.degradedAfter && globalStats.p99 > endpoint.degradedAfter
                    ? "warn"
                    : undefined
                }
              />
            </div>
          </div>
        </div>

        {errors.length > 0 ? (
          <>
            <Card>
              <CardHeader
                actions={[
                  <Button key="errors">
                    <Link
                      href={`/${props.params.teamSlug}/endpoints/${props.params.endpointId}/errors`}
                      className="whitespace-nowrap"
                    >
                      Go to Errors
                    </Link>
                  </Button>,
                ]}
              >
                <CardTitle>Errors</CardTitle>
                <CardDescription>
                  There have been {errors.length} errors in the last 24 hours.
                </CardDescription>
              </CardHeader>
            </Card>
            <Divider />
          </>
        ) : null}
        <Analytics
          endpoint={{
            id: endpoint.id,
            timeout: endpoint.timeout ?? undefined,
            degradedAfter: endpoint.degradedAfter ?? undefined,
            regions: endpoint.regions.map((r) => ({ id: r.id, name: r.name })),
          }}
        />
        <Divider />

        {checks.length > 0 ? (
          <>
            <Chart
              regions={stats.data.map((region) => ({
                ...region,
                regionName:
                  endpoint.regions.find((r) => r.id === region.regionId)?.name ?? region.regionId,
              }))}
              endpoint={{
                timeout: endpoint.timeout ?? undefined,
                degradedAfter: endpoint.degradedAfter ?? undefined,
              }}
            />
            <Divider />
          </>
        ) : null}
        {checks.length > 0 ? (
          <>
            <ChartsSection
              checks={checks}
              endpoint={{
                timeout: endpoint.timeout,
                degradedAfter: endpoint.degradedAfter,
                regions: endpoint.regions,
              }}
              team={{
                slug: props.params.teamSlug,
              }}
            />
            <Divider />
          </>
        ) : null}

        {checks.length > 0 ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Latest Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <LatestTable
                  endpointId={props.params.endpointId}
                  teamSlug={props.params.teamSlug}
                  checks={checks.slice(checks.length - 20).reverse()}
                  degradedAfter={endpoint.degradedAfter}
                  timeout={endpoint.timeout}
                  regions={endpoint.regions}
                />
              </CardContent>
            </Card>
          </>
        ) : null}
      </main>
    </div>
  );
}
