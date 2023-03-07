import { auth } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
import { Form } from "./dynamic";

export const revalidate = 3600;

export default async function PlayPage(props: {
  searchParams?: {
    url?: string;
    method?: string;
    regions?: string;
    repeat?: string;
  };
}) {
  let regions = await db.region.findMany({
    where: { visible: true },
  });

  const { userId } = auth();
  if (!userId) {
    regions = regions.filter((r) => r.platform === "vercelEdge");
  }

  return (
    <Form
      regions={regions}
      signedIn={Boolean(userId)}
      defaultValues={{
        url1: props.searchParams?.url,
        method: props.searchParams?.method?.toUpperCase(),
        regions: props.searchParams?.regions?.split(","),
      }}
    />
  );
}
