import { db } from "@planetfall/db";
import { auth } from "@clerk/nextjs/app-beta";
import { redirect } from "next/navigation";
import { ClientPage } from "./client";

export default async function AlertsPage(props: { params: { teamSlug: string } }) {
  const { userId } = auth();
  if (!userId) {
    return redirect("/auth/sign-in");
  }
  const team = await db.team.findUnique({
    where: { slug: props.params.teamSlug },
    include: {
      alerts: {
        include: {
          endpoints: {
            where: {
              deletedAt: null,
            },
          },
          emailChannels: true,
          slackChannels: true,
        },
      },
      endpoints: {
        where: {
          deletedAt: null,
        },
      },
    },
  });
  if (!team) {
    return redirect("/home");
  }

  return (
    <ClientPage
      user={{ id: userId }}
      endpoints={team.endpoints.map((endpoint) => ({
        id: endpoint.id,
        name: endpoint.name,
      }))}
      team={{ id: team.id, slug: team.slug }}
      alerts={team.alerts.map((alert) => ({
        id: alert.id,
        emailChannels: alert.emailChannels.map((emailChannel) => ({
          id: emailChannel.id,
          email: emailChannel.email,
        })),
        slackChannels: alert.slackChannels.map((emailChannel) => ({
          id: emailChannel.id,
          url: emailChannel.url,
        })),
        endpoints: alert.endpoints.map((endpoint) => ({
          id: endpoint.id,
          name: endpoint.name,
          url: endpoint.url,
        })),
      }))}
    />
  );
}
