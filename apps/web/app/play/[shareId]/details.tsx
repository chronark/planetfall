"use client";

import React from "react";
import { Heading } from "@/components/heading";
import { Stats } from "@/components/stats";
import { Trace } from "@/components/trace";
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/select";
import { PlayChecks } from "lib/server/routers/play";
import { Card, CardContent, CardHeader, CardHeaderTitle } from "@/components/card";
import { AwsLambda } from "@/components/icons/AwsLambda";
import { VercelEdge } from "@/components/icons/VercelEdge";

type Props = {
  urls: PlayChecks["urls"];
  regions: PlayChecks["regions"];
};

export const Details: React.FC<Props> = ({ regions, urls }) => {
  const [selectedRegion, setSelectedRegion] = React.useState<PlayChecks["regions"][0] | undefined>(
    regions[0],
  );
  return (
    <Card>
      <CardHeader>
        <CardHeaderTitle
          title="Details"
          subtitle="A detailed breakdown by region, including the response and a latency trace"
        />
        <Select
          defaultValue={selectedRegion?.id}
          onValueChange={(id) => setSelectedRegion(regions.find((r) => r.id === id)!)}
        >
          <SelectTrigger className="flex ">
            <SelectValue defaultValue={selectedRegion?.id} />
          </SelectTrigger>

          <SelectContent>
            {regions.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                <div className="flex items-center gap-1">
                  {r.id.startsWith("aws:") ? (
                    <AwsLambda className="w-4 h-4" />
                  ) : (
                    <VercelEdge className="w-4 h-4" />
                  )}
                  {r.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col justify-between w-full divide-y md:flex-row md:divide-y-0 ">
          {selectedRegion?.checks
            .sort((a, b) => a.time - b.time)
            .map((c, i) => {
              /**
               * using `Headers` because checks from edge or from lambdas have different casing
               */
              const headers = new Headers(c.headers);
              const vercelCache = headers.get("x-vercel-cache");

              return (
                <div
                  key={c.id}
                  className={`${
                    selectedRegion.checks.length > 1 ? "lg:w-1/2" : "w-full"
                  } p-4 flex flex-col divide-y divide-zinc-200`}
                >
                  <div className="flex flex-col items-center justify-between">
                    {selectedRegion.checks.length > 1 ? (
                      <>
                        <Heading h3={true}>{urls[i]}</Heading>
                        <span className="text-sm text-zinc-500">
                          {new Date(c.time).toISOString()}
                        </span>
                      </>
                    ) : null}
                    <div className="flex">
                      <Stats label="Latency" value={c.latency?.toLocaleString()} suffix="ms" />

                      <Stats label="Status" value={c.status} />
                      {vercelCache ? <Stats label="Vercel Cache" value={vercelCache} /> : null}
                    </div>
                  </div>
                  {c.timing ? (
                    <div className="py-4 md:py-8">
                      <Heading h4={true}>Trace</Heading>

                      <Trace timings={c.timing} />
                    </div>
                  ) : null}
                  <div className="py-4 md:py-8">
                    <Heading h4={true}>Response Header</Heading>
                    <pre className="p-2 overflow-x-auto rounded bg-zinc-50">
                      {JSON.stringify(c.headers, null, 2)}
                    </pre>
                  </div>
                  <div className="py-4 md:py-8">
                    <Heading h4={true}>Response Body</Heading>
                    <pre className="p-2 overflow-x-auto rounded bg-zinc-50">
                      {atob(c.body ?? "")}
                    </pre>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
};
