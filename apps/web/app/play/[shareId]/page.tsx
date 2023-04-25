import PageHeader from "@/components/page/header";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Redis } from "@upstash/redis";
import { Chart } from "./chart";
import { Table } from "./table";
import { Details } from "./details";
import type { PlayResult } from "@/lib/trpc/routers/play";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { Divider } from "@/components/divider";
import { auth } from "@clerk/nextjs/app-beta";
const redis = Redis.fromEnv();

export const revalidate = 3600;

export default async function Share(props: { params: { shareId: string } }) {
  const res = await redis.get<PlayResult>(["play", props.params.shareId].join(":"));
  if (!res) {
    return notFound();
  }

  const { urls, time } = res;
  const tags = [...new Set(res.regions.flatMap((r) => r.checks).flatMap((c) => c.tags ?? []))];
  const regions = res.regions
    .filter((r) => r.checks.length > 0)
    .sort((a, b) => (b.checks[0].latency ?? 0) - (a.checks[0].latency ?? 0));

  return (
    <div className="bg-zinc-50">
      <PageHeader
        sticky={true}
        title={urls.length > 1 ? urls.join(" vs. ") : urls[0]}
        description={new Date(time).toUTCString()}
      />
      <div className="container relative min-h-screen pb-20 mx-auto">
        <div className="space-y-4 md:space-y-8 lg:space-y-16">
          {regions.length >= 2 ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Latency per Region</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Chart regions={regions} urls={urls} />
                  </div>
                </CardContent>
              </Card>
              <Divider />
            </>
          ) : null}

          {/* Only if there is at least one region with timing data: show the table and details. */}
          {regions.some((r) => r.checks.some((c) => c.timing)) ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Request Trace</CardTitle>
                  <CardDescription>Edge functions do not support tracing yet.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table regions={regions} urls={urls} />
                </CardContent>
              </Card>

              <Divider />
            </>
          ) : null}
          <Details regions={regions} urls={urls} />
          {tags.length > 0 ? (
            <>
              <Divider />
              <Card>
                <CardHeader>
                  <CardTitle>Built With</CardTitle>
                  <CardDescription>
                    This app is built with these frameworks and platforms.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="grid w-full grid-cols-2 gap-4 mx-auto mt-4 md:grid-cols-4 xl:grid-cols-6">
                    {tags.map((tag) => (
                      <li
                        className="px-2 py-1 text-center duration-150 rounded whitespace-nowrap ring-1 ring-zinc-900 hover:bg-zinc-50"
                        key={tag}
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
