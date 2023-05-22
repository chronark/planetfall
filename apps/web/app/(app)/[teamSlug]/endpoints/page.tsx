import PageHeader from "@/components/page/header";
import { getEndpointStatsGlobally } from "@planetfall/tinybird";
import { redirect } from "next/navigation";

import { ClientPage } from "./client";
import { Button } from "@/components/button";
import { Text } from "@/components/text";
import { auth } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
import { Plus } from "lucide-react";
import Link from "next/link";
export const revalidate = 10;

export default async function Page(props: { params: { teamSlug: string } }) {
  const { userId } = auth();
  if (!userId) {
    return redirect("/auth/sign-in");
  }

  const team = await db.team.findUnique({
    where: { slug: props.params.teamSlug },
    include: {
      endpoints: {
        where: {
          deletedAt: null,
        },
      },
    },
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
        active: endpoint.active,
        degradedAfter: endpoint.degradedAfter ?? undefined,
        ownerId: endpoint.ownerId ?? undefined,
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
        ownerId?: string;
        degradedAfter?: number;
        active: boolean;
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
    <ClientPage
      user={{ id: userId }}
      endpoints={endpointsByHost}
      team={{ slug: team.slug, endpoints: team.endpoints.length }}
    />
  );
}
