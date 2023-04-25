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
  const { userId } = auth();

  return (
    <Form
      signedIn={Boolean(userId)}
      defaultValues={{
        url1: props.searchParams?.url,
        method: props.searchParams?.method?.toUpperCase(),
        regions: props.searchParams?.regions?.split(","),
      }}
    />
  );
}
