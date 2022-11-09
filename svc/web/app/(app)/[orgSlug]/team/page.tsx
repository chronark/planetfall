import PageHeader from "@/components/page/header";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { notFound } from "next/navigation";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { TeamTable } from "./table";
export default async function Page(props: { params: { orgSlug: string } }) {


    const org = await clerkClient.organizations.getOrganization({ slug: props.params.orgSlug })

    const memberships = await clerkClient.organizations.getOrganizationMembershipList({ organizationId: org.id })
    const members = memberships.map(m => ({
        role: m.role,
        user: {
            email: m.publicUserData?.identifier,
            image: m.publicUserData?.profileImageUrl
        }
    }))

    return <div>
        <PageHeader sticky title="Team" />
        <main className="container mx-auto">



            <TeamTable members={members} />



        </main>
    </div>
}
