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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialog";
import { Button } from "@/components/button";
import { parseCacheControlHeaders, parseXVercelId } from "@planetfall/header-analysis";
import { Text } from "@/components/text";

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
              const cacheControlDirectives = parseCacheControlHeaders(
                headers.get("cache-control") ?? "",
              );
              const networkHops = parseXVercelId(headers.get("x-vercel-id") ?? "");
              const hopsAlarm =
                networkHops.length > 1 &&
                [...new Set(networkHops.map((h) => h.continent))].length > 1;

              return (
                <div
                  key={c.id}
                  className={`${selectedRegion.checks.length > 1 ? "lg:w-1/2" : "w-full"
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
                    <div className="flex justify-between items-center gap-4">
                      <Heading h4={true}>Response Header</Heading>
                      <div className="flex justify-end items-center gap-4">
                        {networkHops.length > 0 ? (
                          <Dialog>
                            <DialogTrigger>
                              <Button variant={hopsAlarm ? "danger" : undefined}>
                                Vercel Routing
                              </Button>
                            </DialogTrigger>

                            <DialogContent className="flex flex-col gap-2 lg:max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Vercel Network Hops</DialogTitle>
                                <DialogDescription>
                                  {hopsAlarm ? (
                                    <p className="text-sm font-medium text-red-500">
                                      This request was routed through multiple continents. To ensure
                                      low latency, you should try to avoid this.
                                    </p>
                                  ) : (
                                    <p>
                                      This request was routed through the following Vercel regions:
                                    </p>
                                  )}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 overflow-hidden lg:mx-0 lg:max-w-none lg:grid-cols-4">
                                {networkHops.map((hop) => (
                                  <div key={hop.regionId}>
                                    <div
                                      className="flex items-center text-xs font-semibold leading-6 text-zinc-400"
                                    >
                                      <svg viewBox="0 0 4 4" className="mr-4 h-1 w-1 flex-none" aria-hidden="true">
                                        <circle cx={2} cy={2} r={2} fill="currentColor" />
                                      </svg>
                                      {hop.continent}
                                      <div
                                        className="absolute -ml-2 h-px w-screen -translate-x-full bg-zinc-900/10 sm:-ml-4 lg:static lg:ml-8 lg:-mr-6 lg:w-auto lg:flex-auto lg:translate-x-0"
                                        aria-hidden="true"
                                      />
                                    </div>
                                    <p className="mt-6 text-sm font-semibold leading-8 tracking-tight text-zinc-900">{hop.regionName}</p>
                                  </div>
                                ))}
                              </div>

                            </DialogContent>
                          </Dialog>
                        ) : null}
                        {cacheControlDirectives.length > 0 ? (
                          <Dialog>
                            <DialogTrigger>
                              <Button>Cache-Control</Button>
                            </DialogTrigger>

                            <DialogContent className="flex flex-col gap-2">
                              <DialogHeader>
                                <DialogTitle>Cache-Control</DialogTitle>
                                <DialogDescription>
                                  Here is a breakdown of the cache-control header:
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex flex-col gap-4">
                                {cacheControlDirectives.map((d) => (
                                  <div
                                    key={d.directive}
                                    className="flex flex-col items-start gap-1"
                                  >
                                    <Text variant="code">{d.directive}</Text>
                                    <Text variant="subtle" size="xs">
                                      {d.explanation}
                                    </Text>
                                  </div>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : null}
                      </div>
                    </div>
                    <pre className="p-2 mt-4 overflow-x-auto rounded bg-zinc-50">
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
