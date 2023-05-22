import { redirect } from "next/navigation";
import { db } from "@planetfall/db";

import { Client } from "./client";
import { auth } from "@clerk/nextjs/app-beta";

export default async function Page(props: { params: { teamSlug: string; keyId: string } }) {
  const { userId } = auth();
  if (!userId) {
    return redirect("/home");
  }
  const apiKey = await db.apiKey.findUnique({
    where: {
      id: props.params.keyId,
    },
    include: {
      team: {
        include: {
          endpoints: true,
          members: true,
        },
      },
    },
  });
  if (!apiKey) {
    return redirect(`/${props.params.teamSlug}/settings/keys`);
  }
  if (apiKey.team.slug !== props.params.teamSlug) {
    return redirect(`/${props.params.teamSlug}/settings/keys`);
  }
  if (!apiKey.team.members.some((member) => member.userId === userId)) {
  }

  return (
    <Client
      apiKey={apiKey}
      endpointIdToName={apiKey.team.endpoints.reduce(
        (acc, endpoint) => ({ ...acc, [endpoint.id]: endpoint.name }),
        {},
      )}
    />
  );
}
