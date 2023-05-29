import { Row } from "./row";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page";
import { Text } from "@/components/text";
import { auth } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function KeysPage(props: { params: { teamSlug: string } }) {
  const { userId } = auth();
  if (!userId) {
    return redirect("/auth/sign-in");
  }
  const team = await db.team.findUnique({
    where: { slug: props.params.teamSlug },
    include: {
      apiKeys: true,
      endpoints: true,
    },
  });
  if (!team) {
    return redirect("/home");
  }

  return (
    <div>
      <PageHeader
        title="API Keys"
        description="Manage your API keys"
        actions={[
          <Link key="new" href={`/${team.slug}/settings/keys/new`}>
            <Button>New API key</Button>
          </Link>,
        ]}
      />
      <main className="container mx-auto">
        {team.apiKeys.length === 0 ? (
          <div
            key="x"
            className="flex flex-col items-center justify-center max-w-sm p-4 mx-auto md:p-8"
          >
            <Text>You don&apos;t have any API keys yet.</Text>
            <Button size="lg" className="flex items-center gap-2 mt-2 ">
              <Plus className="w-5 h-5" />
              <Link href={`/${team.slug}/settings/keys/new`}>Create your first API key</Link>
            </Button>
          </div>
        ) : (
          <Card role="list" className="mt-8 divide-y divide-zinc-200">
            {team.apiKeys
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((apiKey) => (
                <Row key={apiKey.id} apiKey={apiKey} team={{ slug: team.slug }} />
              ))}
          </Card>
        )}
      </main>
    </div>
  );
}
