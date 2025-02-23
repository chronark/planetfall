import PageHeader from "@/components/page/header";
import { getCheck } from "@planetfall/tinybird";
import { notFound, redirect } from "next/navigation";

import { HeaderTable } from "./header-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Divider } from "@/components/divider";
import { Stats } from "@/components/stats";
import { Tag } from "@/components/tag";
import { Text } from "@/components/text";
import { auth } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
import { AlertCircle, Check } from "lucide-react";
import ms from "ms";
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
  const { userId } = auth();
  if (!userId) {
    return redirect("/auth/sign-in");
  }
  const res = await getCheck({ checkId: props.params.checkId });
  console.log(JSON.stringify({ res }, null, 2));
  const check = res.data.at(0);
  if (!check) {
    return notFound();
  }

  const endpoint = await db.endpoint.findUnique({
    where: { id: check.endpointId },
    include: {
      team: {
        include: {
          members: true,
        },
      },
      regions: {
        where: { id: check.regionId },
      },
    },
  });

  if (!endpoint) {
    return notFound();
  }
  if (!endpoint.team.members.find((member) => member.userId === userId)) {
    return notFound();
  }

  return (
    <div>
      <PageHeader
        sticky={true}
        title={endpoint?.name ?? endpoint?.url ?? check.id}
        description={new Date(check.time).toUTCString()}
        actions={[
          <Tag key="check" variant="outline" size="sm">
            {endpoint?.url}
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
              value={endpoint?.regions.find((r) => r.id === check.regionId)?.name ?? "N/A"}
            />
          </div>
        </div>

        {check.timing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Trace</CardTitle>
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
                <CardTitle>Error</CardTitle>
              </CardHeader>
              <CardContent>
                <Text>{check.error}</Text>
              </CardContent>
            </Card>
          </>
        ) : null}

        {check.headers ? (
          <>
            <Divider />
            <Card>
              <CardHeader>
                <CardTitle>Response Headers</CardTitle>
              </CardHeader>
              <CardContent>
                <HeaderTable
                  header={Object.entries(check.headers as Record<string, string>).map(
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
                <CardTitle>Response Body</CardTitle>
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
