import PageHeader from "@/components/page/header";
import { notFound, redirect } from "next/navigation";
import { getErrors } from "@planetfall/tinybird";

import { db } from "@planetfall/db";
import { ErrorsTable } from "./table";
import { auth } from "@clerk/nextjs/app-beta";
import { Button } from "@/components/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { Divider } from "@/components/divider";

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
    return notFound();
  }

  const errors = (
    await getErrors({ endpointId: endpoint.id, since: Date.now() - 24 * 60 * 60 * 1000 })
  ).data.map((e) => ({
    id: e.id,
    time: e.time,
    error: e.error!,
    status: e.status,
    latency: e.latency,
    region: endpoint.regions.find((r) => r.id === e.regionId)!.name,
    detailsUrl: `/${props.params.teamSlug}/checks/${e.id}`,
  }));

  return (
    <div>
      <PageHeader
        sticky={true}
        title="Errors"
        description={endpoint.name}
        actions={[
          <Button key="endpoint">
            <Link href={`/${props.params.teamSlug}/endpoints/${props.params.endpointId}`}>
              Endpoint
            </Link>
          </Button>,
        ]}
      />
      <main className="container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{errors.length} Errors</CardTitle>={`${errors.length} Errors`}
            <CardDescription>in the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorsTable errors={errors} />
          </CardContent>
        </Card>
        <Divider />
      </main>
    </div>
  );
}
