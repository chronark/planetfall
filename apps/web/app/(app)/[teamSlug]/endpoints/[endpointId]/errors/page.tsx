import PageHeader from "@/components/page/header";
import { notFound, redirect } from "next/navigation";
import { Client as Tinybird } from "@planetfall/tinybird";

import { db } from "@planetfall/db";
import { Stats } from "@/components/stats";
import { ErrorsTable } from "./table";
import { Heading } from "@/components/heading";
import { LatestTable } from "../latest-table";
import { DeleteButton } from "../delete";
import { getSession } from "lib/auth";
import { Button } from "@/components/button";
import { Toggle } from "../toggle";
import { Text } from "@/components/text";
import { ChartsSection } from "../chart-by-region";
import { Edu_NSW_ACT_Foundation } from "@next/font/google";
import Link from "next/link";
import { Switch } from "@/components/switch";
import { Chart } from "../chart";
import {
  Card,
  CardContent,
  CardFooter,
  CardFooterStatus,
  CardHeader,
  CardHeaderTitle,
} from "@/components/card";
import { Divider } from "@/components/divider";
import { AlertCircle } from "lucide-react";

export const revalidate = 10;

export default async function Page(props: {
  params: { teamSlug: string; endpointId: string };
}) {
  const { session } = await getSession();
  if (!session) {
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
  if (!endpoint) {
    redirect(`/${props.params.teamSlug}/endpoints`);
  }

  if (
    endpoint.team.slug !== props.params.teamSlug ||
    !endpoint.team.members.find((m) => m.userId === session.user.id)
  ) {
    return notFound();
  }

  const tb = new Tinybird();

  const checks = await tb.getLatestChecksByEndpoint(endpoint.id, {
    limit: 10000,
  });

  const errors = checks
    .filter((c) => Boolean(c.error))
    .map((e) => ({
      id: e.id,
      time: e.time,
      error: e.error!,
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
            <Link href={`/${props.params.teamSlug}/endpoints/${props.params.endpointId}}`}>
              Endpoint
            </Link>
          </Button>,
        ]}
      />
      <main className="container mx-auto">
        <Card>
          <CardHeader>
            <CardHeaderTitle title={`${errors.length} Errors`} subtitle="in the last 24 hours" />
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
