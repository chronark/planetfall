import PageHeader from "@/components/page/header";
import { redirect } from "next/navigation";
import { getEndpointStatsGlobally } from "@planetfall/tinybird";

import { Text } from "@/components/text";
import { Button } from "@/components/button";
import { EndpointsTable } from "./table";
import { db } from "@planetfall/db";
import { auth } from "@clerk/nextjs/app-beta";
import Link from "next/link";
import { Card, CardContent } from "@/components/card";
import { Plus } from "lucide-react";

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
          <Card>
            <CardContent>
              <EndpointsTable endpoints={endpointStats} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
