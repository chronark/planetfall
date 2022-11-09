import { clerkClient } from "@clerk/clerk-sdk-node";
import { notFound, redirect } from "next/navigation";

export default async function Page(props: { params: { orgSlug: string } }) {

  const org = await clerkClient.organizations.getOrganization({slug: props.params.orgSlug}).catch(err=>{
    console.warn(err)
    return null
  })

  if (!org) {
    notFound()
    return
  }

  redirect(`/${org.slug}/team`)

  return <div></div>;
}
