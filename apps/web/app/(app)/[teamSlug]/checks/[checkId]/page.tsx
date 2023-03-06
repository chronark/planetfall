import PageHeader from "@/components/page/header";
import { notFound, redirect } from "next/navigation";
import { Client as Tinybird } from "@planetfall/tinybird";

import { Button } from "@/components/button";
import { db } from "@planetfall/db";
import { Stats } from "@/components/stats";
import { Heading } from "@/components/heading";
import ms from "ms";
import { Text } from "@/components/text";
import { HeaderTable } from "./header-table";
import { auth } from "@clerk/nextjs/app-beta";
import Link from "next/link";
import { Tag } from "@/components/tag";
import { AlertCircle, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardHeaderTitle } from "@/components/card";
import { Divider } from "@/components/divider";

type Timings = {
  dnsStart: number;
  dnsDone: number;
  connectStart: number;
  connectDone: number;
  tlsHandshakeStart: number;
  tlsHandshakeDone: number;
  firstByteStart: number;
  firstByteDone: number;
  transferStart: number;
  transferDone: number;
};

const DNS: React.FC<{ timings: Timings }> = ({ timings }): JSX.Element => {
  const start = Math.min(...Object.values(timings).filter((t) => t > 0));
  const end = Math.max(...Object.values(timings).filter((t) => t > 0));

  return (
    <div className="transition-all duration-500">
      {timings.dnsDone > 0 ? (
        <div className="flex items-center w-full gap-4 py-1 duration-500 rounded hover:bg-zinc-100">
          <div className="flex justify-between w-1/5 text-sm text-zinc-500 whitespace-nowrap ">
            <span>DNS</span>
            <span>{(timings.dnsDone - timings.dnsStart).toLocaleString()} ms</span>
          </div>
          <div className="flex w-4/5">
            <div
              style={{
                width: `${
                  (Math.max(1, timings.dnsDone - timings.dnsStart) / (end - start)) * 100
                }%`,
              }}
            >
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded-sm" />
            </div>
          </div>
        </div>
      ) : null}

      {timings.connectDone > 0 ? (
        <div className="flex items-center w-full gap-4 py-1 duration-500 rounded hover:bg-zinc-100">
          <div className="flex justify-between w-1/5 text-sm text-zinc-500 whitespace-nowrap ">
            <span>Connection</span>
            <span>{(timings.connectDone - timings.connectStart).toLocaleString()} ms</span>
          </div>
          <div className="flex w-4/5">
            <div
              style={{
                width: `${((timings.connectStart - start) / (end - start)) * 100}%`,
              }}
            />
            <div
              style={{
                width: `${
                  (Math.max(1, timings.connectDone - timings.connectStart) / (end - start)) * 100
                }%`,
              }}
            >
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded-sm" />
            </div>
          </div>
        </div>
      ) : null}
      {timings.tlsHandshakeDone > 0 ? (
        <div className="flex items-center w-full gap-4 py-1 duration-500 rounded hover:bg-zinc-100">
          <div className="flex justify-between w-1/5 text-sm text-zinc-500 whitespace-nowrap ">
            <span>TLS</span>
            <span>
              {(timings.tlsHandshakeDone - timings.tlsHandshakeStart).toLocaleString()} ms
            </span>
          </div>
          <div className="flex w-4/5">
            <div
              style={{
                width: `${((timings.tlsHandshakeStart - start) / (end - start)) * 100}%`,
              }}
            />
            <div
              style={{
                width: `${
                  (Math.max(1, timings.tlsHandshakeDone - timings.tlsHandshakeStart) /
                    (end - start)) *
                  100
                }%`,
              }}
            >
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded-sm" />
            </div>
          </div>
        </div>
      ) : null}
      {timings.firstByteDone > 0 ? (
        <div className="flex items-center w-full gap-4 py-1 duration-500 rounded hover:bg-zinc-100">
          <div className="flex justify-between w-1/5 text-sm text-zinc-500 whitespace-nowrap ">
            <span>Waiting for response</span>
            <span>{(timings.firstByteDone - timings.firstByteStart).toLocaleString()} ms</span>
          </div>
          <div className="flex w-4/5">
            <div
              style={{
                width: `${((timings.firstByteStart - start) / (end - start)) * 100}%`,
              }}
            />
            <div
              style={{
                width: `${
                  (Math.max(1, timings.firstByteDone - timings.firstByteStart) / (end - start)) *
                  100
                }%`,
              }}
            >
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded-sm" />
            </div>
          </div>
        </div>
      ) : null}
      {timings.transferDone > 0 ? (
        <div className="flex items-center w-full gap-4 py-1 duration-500 rounded hover:bg-zinc-100">
          <div className="flex justify-between w-1/5 text-sm text-zinc-500 whitespace-nowrap ">
            <span>Transfer</span>
            <span>{(timings.transferDone - timings.transferStart).toLocaleString()} ms</span>
          </div>
          <div className="flex w-4/5">
            <div
              style={{
                width: `${((timings.transferStart - start) / (end - start)) * 100}%`,
              }}
            />
            <div
              style={{
                width: `${
                  (Math.max(1, timings.transferDone - timings.transferStart) / (end - start)) * 100
                }%`,
              }}
            >
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded-sm" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default async function Page(props: {
  params: { teamSlug: string; checkId: string };
}) {
  const check = await db.check.findUnique({
    where: { id: props.params.checkId },
  });

  if (!check) {
    console.warn(__filename, "User not found");
    notFound();
    return;
  }

  const { userId } = auth();
  if (!userId) {
    return redirect("/auth/sign-in");
  }

  const endpoint = check.endpointId
    ? await db.endpoint.findUnique({ where: { id: check.endpointId } })
    : null;

  const regions = await db.region.findMany({ where: { visible: true } });

  return (
    <div>
      <PageHeader
        sticky={true}
        title={endpoint?.name ?? endpoint?.url ?? check.id}
        description={new Date(check.time).toUTCString()}
        actions={[
          <Tag key="check" variant="outline" size="sm">
            {check.id}
          </Tag>,
        ]}
      />
      <main className="container mx-auto">
        <div className="pt-2 mb-4 md:pt-4 lg:pt-8 md:mb-8 lg:mb-16">
          <div className="flex items-center justify-between w-full gap-2 md:gap-4 lg:gap-8">
            <Stats
              label={check.error ? "Error" : "Success"}
              value={
                check.error ? (
                  <AlertCircle className="w-8 h-8 m-1" />
                ) : (
                  <Check className="w-8 h-8 m-1" />
                )
              }
            />
            <Stats
              label="Time"
              value={ms(Date.now() - new Date(check.time).getTime())}
              suffix="ago"
            />
            <Stats label="Status" value={check.status?.toString() ?? "None"} />
            <Stats label="Latency" value={check.latency?.toLocaleString() ?? "None"} suffix="ms" />
            <Stats
              label="Region"
              value={regions.find((r) => r.id === check.regionId)?.name ?? "X"}
            />
          </div>
        </div>

        {check.timing ? (
          <>
            <Card>
              <CardHeader>
                <CardHeaderTitle title="Trace" />
              </CardHeader>
              <CardContent>
                <DNS timings={check.timing as Timings} />
              </CardContent>
            </Card>
          </>
        ) : null}
        {check.error ? (
          <>
            <Divider />
            <Card>
              <CardHeader>
                <CardHeaderTitle title="Error" />
              </CardHeader>
              <CardContent>
                <Text>{check.error}</Text>
              </CardContent>
            </Card>
          </>
        ) : null}

        {check.header ? (
          <>
            <Divider />
            <Card>
              <CardHeader>
                <CardHeaderTitle title="Response Headers" />
              </CardHeader>
              <CardContent>
                <HeaderTable
                  header={Object.entries(check.header as Record<string, string>).map(
                    ([key, value]) => ({ key, value }),
                  )}
                />
              </CardContent>
            </Card>
          </>
        ) : null}
        {check.body ? (
          <>
            <Divider />
            <Card>
              <CardHeader>
                <CardHeaderTitle title="Response Body" />
              </CardHeader>
              <CardContent>
                <code>{atob(check.body)}</code>
              </CardContent>
            </Card>
          </>
        ) : null}
      </main>
    </div>
  );
}
